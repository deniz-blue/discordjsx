import { type APIModalInteractionResponseCallbackData, type AttachmentPayload, ChatInputCommandInteraction, type Interaction, MessageFlags, ModalSubmitInteraction, type SelectMenuInteraction } from "discord.js";
import { v4 } from "uuid";
import { createNanoEvents, Unsubscribe } from "nanoevents";
import type { DJSXMessageRendererEventMap, DJSXModalRendererEventMap, DJSXRendererOptions } from "./types.js";
import { type InternalNode, JSXRenderer } from "../reconciler/index.js";
import type { DJSXEventHandlerMap } from "../types/index.js";
import { INTERACTION_TOKEN_TIMEOUT, MessageUpdater, REPLY_TIMEOUT, type MessageUpdateable } from "../updater/index.js";
import { PayloadBuilder } from "../payload/index.js";
import { resolveFile } from "../utils/resolve.js";
import { defaultLog } from "src/utils/log.js";

abstract class DJSXRenderer {
    private renderer = new JSXRenderer();

    protected abstract onRender(node: InternalNode | null): unknown;
    protected abstract onError(error: Error): unknown;

    constructor(
        node?: React.ReactNode,
        readonly key = v4(),
    ) {
        this.node = node;
        
        this.renderer.on("render", (container, node) => this.onRender(node));
        this.renderer.on("renderError", error => this.onError(error));
    }
    
    private _node: React.ReactNode = null;
    
    set node(node: React.ReactNode) {
        this._node = node;
        this.renderer.setRoot(this.node);
    }

    get node() {
        return this._node;
    }

    protected get prefixCustomId() {
        return `djsx:${this.key || "auto"}`;
    }
}
export class DJSXModalRenderer extends DJSXRenderer {
    private events: DJSXEventHandlerMap = {
        button: new Map(),
        select: new Map(),
        modalSubmit: new Map(),
    };

    private renderPromise: PromiseWithResolvers<APIModalInteractionResponseCallbackData>;
    private timeout?: NodeJS.Timeout;
    private emitter = createNanoEvents<DJSXModalRendererEventMap>();

    constructor(
        interaction: ChatInputCommandInteraction,
        node?: React.ReactNode,
        {
            key = v4(),
            timeout = INTERACTION_TOKEN_TIMEOUT,
        }: {
            key?: string,
            timeout?: number,
        } = {},
    ) {
        super(node, key);
        this.renderPromise = Promise.withResolvers();

        this.renderPromise.promise
            .then(async data => {
                await interaction.showModal(data);

                this.timeout = setTimeout(() => {
                    this.emitter.emit('inactivity');
                }, timeout);
            })
            .catch(err => {
                this.emitter.emit('error', err);
            });
    }

    async dispatchInteraction(interaction: Interaction) {
        if (this.key
            && "customId" in interaction
            && !interaction.customId.startsWith(this.prefixCustomId)
        ) {
            return;
        }

        if (interaction.isModalSubmit()) {
            const cb = this.events.modalSubmit.get(interaction.customId);
            const form: Record<string, string> = {};
            for (const [name, component] of interaction.fields.fields) {
                form[name] = component.value;
            }
            cb?.(form, interaction);

            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.emitter.emit('modalResponded', interaction, form);
        }
    }

    protected async onRender(node: InternalNode | null) {
        if (!node) {
            this.renderPromise.reject(new Error('Did not produce modal node on initial render'));
            return;
        }

        const payload = PayloadBuilder.createModal(this.prefixCustomId, node);
        this.events = payload.eventHandlers;

        this.renderPromise.resolve(payload.body);
    }

    protected async onError(error: Error) {
        this.renderPromise.reject(new Error('Modal failed to render', { cause: error })); 
    }
    
    on<K extends keyof DJSXModalRendererEventMap>(event: K, cb: DJSXModalRendererEventMap[K]): Unsubscribe {
        return this.emitter.on(event, cb);
    }
}

export class DJSXMessageRenderer extends DJSXRenderer {
    private events: DJSXEventHandlerMap = {
        button: new Map(),
        select: new Map(),
        modalSubmit: new Map(),
    };

    emitter = createNanoEvents<DJSXMessageRendererEventMap>();

    updater: MessageUpdater;

    interactible: boolean;

    private readonly log: (level: "message" | "warn" | "error" | "trace", category: string, message: string, ...args: any[]) => void;
    private readonly defaultFlags: MessageFlags[];

    constructor(
        interaction: MessageUpdateable,
        node?: React.ReactNode,
        {
            key = v4(),
            interactible = true,
            defaultFlags = [MessageFlags.IsComponentsV2],
            deferAfter = REPLY_TIMEOUT,
            disableAfter,
            createErrorMessage,
            log = defaultLog
        }: DJSXRendererOptions = {},
    ) {
        super(node, key);
        this.updater = new MessageUpdater(interaction, defaultFlags, deferAfter, disableAfter, createErrorMessage, log);

        this.log = log;
        this.defaultFlags = defaultFlags;
        
        this.interactible = interactible;

        this.updater.emitter.on("tokenExpired", () => {
            this.node = null;
            this.emitter.emit("inactivity");
        });
        this.updater.emitter.on('timeout', () => {
            this.node = null;
            this.emitter.emit('inactivity');
        });
    }

    async dispatchInteraction(interaction: Interaction) {
        if (this.key
            && "customId" in interaction
            && !interaction.customId.startsWith(this.prefixCustomId)
        ) {
            return;
        }

        if (!this.interactible) {
            return;
        }

        if (interaction.isButton()) {
            const cb = this.events.button.get(interaction.customId);
            cb?.(interaction);
        } else if ('isAnySelectMenu' in interaction
            ? interaction.isAnySelectMenu() // discord.js@14
            : (interaction as any).isSelectMenu() // discord.js@15
        ) {
            const cb = this.events.select.get((interaction as SelectMenuInteraction).customId);
            cb?.((interaction as SelectMenuInteraction).values, (interaction as SelectMenuInteraction));
        }

        if (interaction.isMessageComponent()) {
            this.updater.target = interaction;
        }
    }

    protected async onError(error: Error) {
        this.updater.handleError(error);
    }

    protected async onRender(node: InternalNode | null) {
        if (!node) return;

        this.log('trace', 'jsx/renderer', 'Rendering node', node);
        
        try {
            const payload = PayloadBuilder.createMessage(this.prefixCustomId, this.defaultFlags, node)
            this.events = payload.eventHandlers;

            // TODO: don't re-upload files from last message version
            const files: AttachmentPayload[] = [];
            for (const [name, attachment] of payload.attachments) {
                files.push({
                    name,
                    attachment: await resolveFile(attachment),
                });
            }

            await this.updater.updateMessage(payload.flags, { ...payload.options, files });
        } catch (e) {
            this.updater.handleError(e as Error);
        };
    }

    on<K extends keyof DJSXMessageRendererEventMap>(event: K, cb: DJSXMessageRendererEventMap[K]): Unsubscribe {
        return this.emitter.on(event, cb);
    }

    async disable() {
        return await this.updater.disable();
    }
}
