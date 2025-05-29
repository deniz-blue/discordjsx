import type { BaseMessageOptions, BaseInteraction, BitFieldResolvable, MessageFlags, ModalSubmitInteraction } from "discord.js";
import type { DJSXMessageRenderer } from "./DJSXRenderer.js";

export interface DJSXMessageRendererEventMap {
    inactivity(): void;
    updatedMessage(using: "reply" | "interaction" | "component"): void;
}

export interface DJSXModalRendererEventMap {
    inactivity(): void;
    modalResponded(interaction: ModalSubmitInteraction, form: Record<string, string>): void;
    error(error: Error): void;
}

export type DJSXRendererOptions = {
    /**
     * Renderer key used to uniquely identify this renderer, and used as a prefix for its components' custom IDs
     * 
     * Default: Random UUIDv4
     */
    key?: string,

    /**
     * The amount of time (in milliseconds) to wait before deferring a reply to either a component interaction on the
     * rendered message, or the initial interaction if passing an {@link BaseInteraction} to {@link DJSXMessageRenderer}.
     * 
     * Default: 2 seconds.
     */
    deferAfter?: number;

    /**
     * The amount of time (in milliseconds) to wait before disabling components on the message.
     * 
     * Default: none.
     */
    disableAfter?: number;

    createErrorMessage?: (error: Error) => BaseMessageOptions;

    log?: (level: 'message' | 'warn' | 'error' | 'trace', category: string, message: string, ...args: any[]) => void;
    
    /**
     * Whether to respond to interaction events tied to components in the message.
     * 
     * Default: `true`
     */
    interactible?: boolean;

    /**
     * Message flags to respond with if the component doesn't have a top-level <message> component.
     * 
     * Default: `[MessageFlags.IsComponentsV2]`
     */
    defaultFlags?: (MessageFlags.Ephemeral | MessageFlags.IsComponentsV2)[];
};
