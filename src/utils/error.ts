import { blockQuote, codeBlock, ComponentType, MessageFlags, resolveColor } from "discord.js";
import { MessageUpdateData } from "../updater/update-target.js";

export const createErrorPayload = (
    error: Error,
    info?: React.ErrorInfo,
): MessageUpdateData => {
    // Build a readable error payload using Components V2
    const title = "### ⚠️ `discord-jsx-renderer`: failed to render";
    const header = `**${error.name}**: ${error.message}`;
    const stackText = error.stack ?? error.toString();

    const parts: Array<{ type: ComponentType; content?: string } | any> = [];

    // Title / header
    parts.push({
        type: ComponentType.TextDisplay,
        content: title,
    });

    // Brief error line
    parts.push({
        type: ComponentType.TextDisplay,
        content: header,
    });

    // Stack as a code block for readability
    parts.push({
        type: ComponentType.TextDisplay,
        content: codeBlock(stackText),
    });

    // Optional React component stack
    if (info?.componentStack) {
        parts.push({
            type: ComponentType.TextDisplay,
            content: `**Component Stack**\n${codeBlock(info.componentStack)}`,
        });
    }

    return {
        flags: [MessageFlags.IsComponentsV2],
        components: [
            {
                type: ComponentType.Container,
                // Use a visible accent color for errors
                accent_color: resolveColor("Yellow"),
                components: parts,
            },
        ],
    };
};
