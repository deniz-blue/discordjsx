import { APIMessageComponent, AttachmentPayload, blockQuote, codeBlock, ComponentType, DiscordAPIError, inlineCode, MessageFlags, resolveColor } from "discord.js";
import { MessageUpdateData } from "../updater/update-target.js";
import PACKAGE_JSON from "../../package.json" with { type: "json" };

const VERSION = PACKAGE_JSON.version;

const prettifyStack = (stack: string) => {
    return stack.split("\n").map(
        line => line.trim().startsWith("at ") ? (
            line.replace(/ \(.*\)/, "")
        ) : line
    ).join("\n");
};

export const createErrorPayload = (
    error: Error,
    info?: React.ErrorInfo,
): MessageUpdateData => {
    const title = `### ⚠️ ${error.name}`;
    const header = `${codeBlock(error.message)}`;
    const stackText = prettifyStack(error.stack ?? error.toString());

    const parts: Array<APIMessageComponent> = [];
    const files: AttachmentPayload[] = [];

    parts.push({
        type: ComponentType.TextDisplay,
        content: title,
    });

    parts.push({
        type: ComponentType.TextDisplay,
        content: header,
    });

    parts.push({
        type: ComponentType.TextDisplay,
        content: `📜 **Stack**\n${codeBlock(stackText)}`,
    });

    if (info?.componentStack) {
        parts.push({
            type: ComponentType.TextDisplay,
            content: `⚛️ **React Component Stack**\n${codeBlock("js", prettifyStack(info.componentStack))}`,
        });
    }

    if(error instanceof DiscordAPIError) {
        parts.push({
            type: ComponentType.TextDisplay,
            content: `📁 **Request Body:**\n${codeBlock("js", JSON.stringify(error.requestBody.json, null, 2))}`,
        });
        parts.push({
            type: ComponentType.TextDisplay,
            content: `❗ **Raw Error:**\n${codeBlock("js", JSON.stringify(error.rawError, null, 2))}`,
        });
    }

    parts.push({
        type: ComponentType.TextDisplay,
        content: `-# Check console for more details\n-# discord-jsx-renderer@${VERSION}`,
    })

    return {
        flags: [MessageFlags.IsComponentsV2],
        components: [
            {
                type: ComponentType.Container,
                components: parts,
            },
            ...files.map(({ name }) => ({
                type: ComponentType.File,
                file: { url: `attachment://${name}` },
            }))
        ],
        files,
    };
};
