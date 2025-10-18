import { BaseChannel, BaseInteraction, type BaseMessageOptions, blockQuote, codeBlock, ComponentType, DiscordAPIError, Message, MessageFlags, resolveColor, User } from "discord.js";
import { debounceAsync } from "../utils/debounceAsync.js";
import { markComponentsDisabled } from "../utils/markComponentsDisabled.js";
import { createNanoEvents, type Unsubscribe } from "nanoevents";
import { INTERACTION_TOKEN_EXPIRY, type MessageUpdateable, INTERACTION_REPLY_EXPIRY } from "./types.js";
import { pickMessageFlags, isUpdateableNeedsReply } from "./utils.js";
import { defaultLog } from "../utils/log.js";
import Mutex from "../utils/mutex.js";

export const REPLY_TIMEOUT = INTERACTION_REPLY_EXPIRY - 1000;
export const INTERACTION_TOKEN_TIMEOUT = INTERACTION_TOKEN_EXPIRY - 30 * 1000;

export type InteractionMessageUpdaterEventMap = {
    tokenExpired(): void;
    timeout(): void;
    messageUpdated(method: "reply" | "editReply" | "update"): void;
};

export class MessageUpdater {
    tokenExpired = false;
    timedOut = false;
    emitter = createNanoEvents<InteractionMessageUpdaterEventMap>();

    private payload: BaseMessageOptions | null = null;

    private tokenExpiryTimeout: NodeJS.Timeout | null = null;

    constructor(
        target: MessageUpdateable,
        private flags: MessageFlags[],
        private readonly deferAfter: number,
        disableAfter?: number,
        private readonly createErrorMessage: (error: Error) => BaseMessageOptions = this.createErrorPayload.bind(this),
        private readonly log: (level: 'message' | 'warn' | 'error' | 'trace', category: string, message: string, ...args: any[]) => void = defaultLog,
    ) {
        this.target = target;

        if (deferAfter && target instanceof BaseInteraction && target.isRepliable()) {
            setTimeout(async () => {
                // there's a race condition here because interaction.deferred will only be set after the request commpletes
                // so if a message tries to send after this call starts but before it completes, it will silently fail
                // because of this, we use a mutex.
                
                try {
                    await this.updateTargetMutex.runInMutex(async () => {
                        if (!target.replied && !target.deferred) {
                            this.log('trace', 'jsx/updater', `Deferring reply to interaction ${target.id} due to no initial reply in time`);
                            await target.deferReply({
                                // HACK: type assertion until discord.js typings are updated to include MessageFlags.IsComponentsV2
                                flags: pickMessageFlags(this.flags, [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]) as [MessageFlags.Ephemeral]
                            });
                        } else {
                            this.log('trace', 'jsx/updater', `Not deferring reply to interaction ${target.id} because it's already replied or deferred`);
                        }
                    });
                } catch (err) {
                    this.log('error', 'jsx/updater', `Failed to defer reply to interaction ${target.id}`, err);
                }
            }, REPLY_TIMEOUT);
        }

        if (disableAfter) {
            setTimeout(() => this.onTimeout(), disableAfter);
        }
    }

    private _target: MessageUpdateable = undefined!;
    set target(target: MessageUpdateable) {
        this._target = target;

        this.resetExpiry();

        if (this.deferAfter && isUpdateableNeedsReply(target)) {
            setTimeout(async () => {
                // same race condition as above
                try {
                    await this.updateTargetMutex.runInMutex(async () => {
                        this.log('trace', 'jsx/updater', `Deferring update to component interaction ${target.id}`);
                        if (!target.replied && !target.deferred) {
                            await target.deferUpdate();
                        }
                    });
                } catch (err) {
                    this.log('error', 'jsx/updater', `Failed to defer update to component interaction ${target.id}`, err);
                }
            }, this.deferAfter);
        }
    }
    get target() {
        return this._target;
    }

    private resetExpiry() {
        if (this.tokenExpiryTimeout) {
            clearTimeout(this.tokenExpiryTimeout);
        }

        this.tokenExpired = false;
        this.tokenExpiryTimeout = setTimeout(() => this.onTokenExpired(), INTERACTION_TOKEN_TIMEOUT);
    }

    private readonly updateTargetMutex = new Mutex();
    updateMessage = debounceAsync(async (...args: Parameters<MessageUpdater['_updateMessage']>) => {
        return await this._updateMessage(...args);
    }, 300, this.updateTargetMutex);

    private async _updateMessage(flags: MessageFlags[], options: BaseMessageOptions) {
        if (this.tokenExpired) {
            this.log('message', 'jsx/updater', "Tried to updateMessage on an expired interaction");
            return;
        }

        this.flags = flags;
        this.payload = options;

        try {
            await this.updateMessageRaw();
        } catch (e) {
            await this.handleError(e as Error);
        }
    }

    // Error handling

    async handleError(error: Error) {
        if (error instanceof DiscordAPIError && error.code === 10062) {
            this.tokenExpired = true;
            return;
        }

        this.payload = this.createErrorMessage(error);

        try {
            await this.updateMessageRaw();
        } catch (e) {
            this.log('error', "jsx/updater", "Couldn't show render-error message for:", error);
            this.log('error', "jsx/updater", "Error thrown while trying to show error message:", e);
        }
    }

    private createErrorPayload(e: Error): BaseMessageOptions {
        const content = [
            "-# `discord-jsx-renderer`: failed to render",
            "### ⚠️ **Error**",
            "",
            codeBlock(`${e.toString()}\n\n${e.stack}`),
        ].join("\n");

        if (this.flags.includes(MessageFlags.IsComponentsV2)) {
            return {
                components: [
                    {
                        type: ComponentType.Container,
                        accent_color: resolveColor("Yellow"),
                        components: [
                            {
                                type: ComponentType.TextDisplay,
                                content,
                            },
                        ],
                    },
                ],
            };
        }

        return {
            content: blockQuote(content),
        };
    }

    // Raw

    async updateMessageRaw() {
        if (!this.payload) {
            throw new Error('Missing payload!');
        }

        if (this.target instanceof BaseInteraction) {
            if (this.target.replied || this.target.deferred) {
                this.log('trace', 'jsx/updater', `Editing reply to interaction ${this.target.id}`, this.payload);
                await this.target.editReply({
                    ...this.payload,
                    flags: pickMessageFlags(this.flags, [MessageFlags.SuppressEmbeds, MessageFlags.IsComponentsV2]),
                });
            } else {
                if (
                    this.target.isChatInputCommand()
                    || (this.target.isModalSubmit() && !this.target.isFromMessage())
                ) {
                    this.log('trace', 'jsx/updater', `Replying to command or modal interaction ${this.target.id}`, this.payload);
                    await this.target.reply({
                        ...this.payload,
                        flags: pickMessageFlags(this.flags, [
                            MessageFlags.Ephemeral,
                            MessageFlags.SuppressEmbeds,
                            MessageFlags.SuppressNotifications,
                            MessageFlags.IsComponentsV2,
                        ]),
                    });
                } else if (
                    this.target.isMessageComponent()
                    || (this.target.isModalSubmit() && this.target.isFromMessage())
                ) {
                    this.log('trace', 'jsx/updater', `Replying to component interaction ${this.target.id}`, this.payload);
                    await this.target.update({
                        ...this.payload,
                        flags: pickMessageFlags(this.flags, [MessageFlags.SuppressEmbeds, MessageFlags.IsComponentsV2]),
                    });
                }
            }
        } else if (this.target instanceof Message) {
            this.log('trace', 'jsx/updater', `Updating message ${this.target.id}`, this.payload);
            await this.target.edit({
                ...this.payload,
                flags: pickMessageFlags(this.flags, [MessageFlags.SuppressEmbeds, MessageFlags.IsComponentsV2]),
            });
        } else if (this.target instanceof BaseChannel) {
            this.log('trace', 'jsx/updater', `Messaging in channel ${this.target.id}`, this.payload);
            this.target = await this.target.send({
                ...this.payload,
                flags: pickMessageFlags(this.flags, [
                    MessageFlags.SuppressEmbeds,
                    MessageFlags.SuppressNotifications,
                    MessageFlags.IsComponentsV2,
                ]),
            });
        } else if (this.target instanceof User) {
            this.log('trace', 'jsx/updater', `DMing user ${this.target.id}`, this.payload);
            this.target = await (await this.target.createDM()).send({
                ...this.payload,
                flags: pickMessageFlags(this.flags, [
                    MessageFlags.SuppressEmbeds,
                    MessageFlags.SuppressNotifications,
                    MessageFlags.IsComponentsV2,
                ]),
            });
        }
    }

    // Expiry and disabling

    private async onTokenExpired() {
        await this.disable();
        this.tokenExpired = true;
        this.timedOut = true;
        this.emitter.emit("tokenExpired");
    }

    private async onTimeout() {
        await this.disable();
        this.timedOut = true;
        this.emitter.emit("timeout");
    }

    async disable() {
        if (!this.payload || this.tokenExpired || this.timedOut) return;

        this.payload = markComponentsDisabled(this.payload);

        try {
            await this.updateMessageRaw();
        } catch (e) {
            this.log('error', 'jsx/updater', 'While trying to disable message components', e);
        }
    }

    // Events

    on<K extends keyof InteractionMessageUpdaterEventMap>(this: this, event: K, cb: InteractionMessageUpdaterEventMap[K]): Unsubscribe {
        return this.emitter.on(event, cb);
    }
};
