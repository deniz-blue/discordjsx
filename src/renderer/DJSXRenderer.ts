import { type AttachmentPayload, type Interaction, MessageFlags, type SelectMenuInteraction } from "discord.js";
import { v4 } from "uuid";
import { createNanoEvents } from "nanoevents";
import type { DJSXRendererEventMap, DJSXRendererOptions } from "./types.js";
import { type InternalNode, JSXRenderer } from "../reconciler/index.js";
import type { DJSXEventHandlerMap } from "../intrinsics/index.js";
import { MessageUpdater, REPLY_TIMEOUT, type MessageUpdateable } from "../updater/index.js";
import { PayloadBuilder } from "../payload/PayloadBuilder.js";
import { resolveFile } from "../utils/resolve.js";
import { defaultLog } from "../utils/log.js";

export class DJSXRenderer {
    private renderer = new JSXRenderer();
    private events: DJSXEventHandlerMap = {
        button: new Map(),
        select: new Map(),
        modalSubmit: new Map(),
    };

    emitter = createNanoEvents<DJSXRendererEventMap>();

    updater: MessageUpdater;

    interactible: boolean;

    /** Unique per renderer. Used to prevent filenames from being guessable. */
    private readonly fileNameSalt = v4();

    readonly key: string;
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
        this.updater = new MessageUpdater(interaction, defaultFlags, deferAfter, disableAfter, createErrorMessage, log);

        this.key = key;
        this.node = node;
        this.log = log;
        this.defaultFlags = defaultFlags;
        
        this.interactible = interactible;

        this.renderer.emitter.on("render", (container, node) => this.onRender(node));
        this.renderer.emitter.on("renderError", error => this.updater.handleError(error));
        this.updater.emitter.on("tokenExpired", () => {
            this.node = null;
            this.emitter.emit("inactivity");
        });
        this.updater.emitter.on('timeout', () => {
            this.node = null;
            this.emitter.emit('inactivity');
        });
    }

    private _node: React.ReactNode = null;
    
    set node(node: React.ReactNode) {
        this._node = node;
        this.renderer.setRoot(this.node);
    }

    get node() {
        return this._node;
    }

    private get prefixCustomId() {
        return `djsx:${this.key || "auto"}`;
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
        } else if (interaction.isModalSubmit()) {
            const cb = this.events.modalSubmit.get(interaction.customId);
            const form: Record<string, string> = {};
            for (const [name, component] of interaction.fields.fields) {
                form[name] = component.value;
            }
            cb?.(form, interaction);
        };

        if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            this.updater.target = interaction;
        }
    }

    private async onRender(node: InternalNode | null) {
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

    async disable() {
        return await this.updater.disable();
    }
}
