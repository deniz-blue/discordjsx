import { ApplicationCommand, blockQuote, bold, channelMention, chatInputApplicationCommandMention, codeBlock, formatEmoji, heading, hideLinkEmbed, hyperlink, inlineCode, italic, roleMention, spoiler, strikethrough, subtext, time, underline, userMention } from "discord.js";
import { InternalNode } from "../reconciler/types.js";

export const getNodeText = (node: InternalNode, listType?: 'ol' | 'ul'): string => {
    const getChildText = () => {
        return node.children?.map(e => getNodeText(e)).join("") ?? "";
    }

    switch (node.type) {
        case "#text":
            return node.props.text as string;
        case "br":
            return '\n';
        case "u":
            return underline(getChildText());
        case "b":
            return bold(getChildText());
        case "i":
            return italic(getChildText());
        case "s":
            return strikethrough(getChildText());
        case "code":
            return inlineCode(getChildText());
        case "pre":
            return codeBlock(node.props.language ?? '', getChildText());
        case "blockquote":
            return `\n${blockQuote(getChildText())}\n`;
        case "emoji":
            return formatEmoji({
                animated: node.props.animated,
                id: node.props.id,
                name: node.props.name ?? '_',
            });
        case "ul":
            return `${node.children.map(e => getNodeText(e, 'ul')).join("\n")}\n`;
        case "ol":
            return `${node.children.map(e => getNodeText(e, 'ol')).join("\n")}\n`;
        case "li":
            return `\n${listType === 'ol' ? '1.' : '- '}${getChildText()}`;
        case "h1":
            return `\n${heading(getChildText(), 1)}\n`;
        case "h2":
            return `\n${heading(getChildText(), 2)}\n`;
        case "h3":
            return `\n${heading(getChildText(), 3)}\n`;
        case "subtext":
            return `\n${subtext(getChildText())}\n`;
        case "spoiler":
            return spoiler(getChildText());
        case "a":
            const childText = getChildText();
            if (!childText) return hideLinkEmbed(node.props.href);
            if (node.props.alt) return hyperlink(childText, node.props.href);
            return hyperlink(childText, node.props.href, node.props.alt);
        case "timestamp":
            return time(node.props.time, node.props.format ?? 'f');
        case "mention":
            if (node.props.user) return userMention(node.props.user);
            if (node.props.member) return `<@!${node.props.member}>`;
            if (node.props.channel) return channelMention(node.props.channel);
            if (node.props.role) return roleMention(node.props.role);
            if (node.props.command) {
                const commandId = node.props.command instanceof ApplicationCommand ? node.props.command.id : node.props.command;
                if (node.props.subcommandGroupName) {
                    return chatInputApplicationCommandMention(node.props.commandName, node.props.subcommandGroupName, node.props.subcommandName, commandId);
                }
                if (node.props.subcommandName) {
                    return chatInputApplicationCommandMention(node.props.commandName, node.props.subcommandName, commandId);
                }
                return chatInputApplicationCommandMention(node.props.commandName ?? '_', commandId);
            }
            return "";
        default:
            return getChildText();
    }
};
