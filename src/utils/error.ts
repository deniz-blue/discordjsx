import { blockQuote, codeBlock, ComponentType, MessageFlags, resolveColor } from "discord.js";

export const createErrorPayload = (
    e: Error,
    flags?: MessageFlags[],
) => {
    const content = [
        "-# `discord-jsx-renderer`: failed to render",
        "### ⚠️ **Error**",
        "",
        codeBlock(`${e.toString()}\n\n${e.stack}`),
    ].join("\n");

    if (!flags || flags.includes(MessageFlags.IsComponentsV2)) {
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
};
