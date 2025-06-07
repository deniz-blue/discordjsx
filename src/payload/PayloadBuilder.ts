import type { APIButtonComponent, APIMessage, APIMessageComponent, APIMessageTopLevelComponent, APIModalComponent, APITextInputComponent, APIUnfurledMediaItem, BufferResolvable } from "discord.js";
import { ApplicationCommand, blockQuote, bold, ButtonStyle, channelMention, chatInputApplicationCommandMention, codeBlock, ComponentType, formatEmoji, heading, hideLinkEmbed, hyperlink, inlineCode, italic, MessageFlags, resolveColor, roleMention, spoiler, strikethrough, subtext, time, underline, userMention } from "discord.js";
import type { InternalNode } from "../reconciler/index.js";
import { v4 } from "uuid";
import type { DJSXEventHandlerMap } from "../intrinsics/index.js";
import type { MessagePayloadOutput, ModalPayloadOutput } from "./types.js";
import type { DefaultButtonProps, LinkButtonProps, PremiumButtonProps } from "../intrinsics/elements/button.js";
import type { MediaItemResolvable } from "../intrinsics/index.js";
import type Stream from "node:stream";
import { resolveEmoji } from "../utils/resolve.js";
import mime from 'mime-types';

type InstrinsicNodesMap = {
    [K in keyof React.JSX.IntrinsicElements]: {
        type: K;
        props: React.JSX.IntrinsicElements[K];
        children: IntrinsicNode[];
    };
};

type IntrinsicNode = InstrinsicNodesMap[keyof React.JSX.IntrinsicElements];

const bufferOrStreamNameCache = new WeakMap<Buffer | Stream | Blob, string>();

export class PayloadBuilder {
    readonly eventHandlers: DJSXEventHandlerMap = {
        button: new Map(),
        select: new Map(),
        modalSubmit: new Map(),
    };

    readonly attachments = new Map<string, BufferResolvable | Stream | Blob | File>();

    createCustomId = () => `${this.prefixCustomId}:${v4()}`;

    private constructor(
        private readonly prefixCustomId: string,
    ) {
    }

    static createMessage(prefixCustomId: string, defaultFlags: MessageFlags[], node: InternalNode) {
        return new PayloadBuilder(prefixCustomId).createMessage(node, defaultFlags);
    }

    static createModal(prefixCustomId: string, node: InternalNode) {
        return new PayloadBuilder(prefixCustomId).createModal(node);
    }

    private getText(node: InternalNode, listType?: 'ol' | 'ul'): string {
        const getChildText = () => {
            return node.children?.map(e => this.getText(e)).join("") ?? "";
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
                return `${node.children.map(e => this.getText(e, 'ul')).join("\n")}\n`;
            case "ol":
                return `${node.children.map(e => this.getText(e, 'ol')).join("\n")}\n`;
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
    }

    createMessage(node: InternalNode, defaultFlags: MessageFlags[]): MessagePayloadOutput {
        // wrap in <message> if not the top-level component
        if (node.type !== "message") {
            node = {
                type: "message",
                props: {
                    ...(defaultFlags.includes(MessageFlags.IsComponentsV2) ? { v2: true } : {}),
                    ...(defaultFlags.includes(MessageFlags.Ephemeral) ? { ephemeral: true } : {}),
                },
                children: [node],
            }
        }

        const flags: MessageFlags[] = [];
        if (node.props.v2) flags.push(MessageFlags.IsComponentsV2);
        if (node.props.ephemeral) flags.push(MessageFlags.Ephemeral);

        const components = this.toDiscordComponentsArray(node.children);

        return {
            flags,
            options: {
                components: components as any,
                content: node.props.v2 ? undefined : this.getText(node),
            },
            eventHandlers: this.eventHandlers,
            attachments: this.attachments,
        };
    }

    createModal(node: InternalNode): ModalPayloadOutput {
        const custom_id = (node.props as React.JSX.IntrinsicElements['modal']).customId || this.createCustomId();
        const components = this.toDiscordComponentsArray(node.children);

        if (node.props.onSubmit)
            this.eventHandlers.modalSubmit.set(custom_id, node.props.onSubmit);

        return {
            body: {
                title: node.props.title,
                components: components as any,
                custom_id,
            },
            eventHandlers: this.eventHandlers,
        };
    }

    private toDiscordComponentsArray(children: InternalNode[]) {
        return children.map(this.toDiscordComponent.bind(this))
            .filter(x => x !== null);
    }

    private toDiscordComponent(_node: InternalNode): APIMessageComponent | APIModalComponent | null {
        const node = _node as IntrinsicNode;

        switch (node.type) {
            case "row":
                return {
                    type: ComponentType.ActionRow,
                    components: this.toDiscordComponentsArray(node.children) as any,
                };
            case "button":
                return this.toDiscordButtonComponent(node);
            case "select":
                return this.toDiscordSelectComponent(node);
            case "text-input":
                return this.toDiscordTextInputComponent(node);
            case "section":
                const nonAccessory = node.children.filter(x => x.type !== "accessory");
                const accessoryNode = node.children.find(x => x.type === "accessory")?.children[0];

                if (!accessoryNode) return null;
                const accessory = this.toDiscordComponent(accessoryNode);
                if (!accessory) return null;

                return {
                    type: ComponentType.Section,
                    components: this.toDiscordComponentsArray(nonAccessory) as any,
                    accessory: accessory as any,
                };
            case "text":
                return {
                    type: ComponentType.TextDisplay,
                    content: this.getText(node),
                };
            case "thumbnail":
                if (!node.props.media) return null;

                return {
                    type: ComponentType.Thumbnail,
                    media: this.resolveAttachment(node.props.media),
                    description: node.props.description,
                    spoiler: node.props.spoiler,
                };
            case "gallery":
                if (!node.children) return null;

                return {
                    type: ComponentType.MediaGallery,
                    items: node.children
                        .filter(child => child.type === 'gallery-item')
                        .map(child => {
                            const props = child.props as React.JSX.IntrinsicElements['gallery-item'];
                            return {
                                media: this.resolveAttachment(props.media),
                                description: props.description,
                                spoiler: props.spoiler,
                            };
                        }),
                };
            case "file":
                return {
                    type: ComponentType.File,
                    file: this.resolveAttachment(node.props.file), 
                    spoiler: node.props.spoiler,
                };
            case "separator":
                return {
                    type: ComponentType.Separator,
                    divider: node.props.divider,
                    spacing: node.props.spacing === "lg" ? 2 : 1,
                };
            case "container":
                return {
                    type: ComponentType.Container,
                    components: this.toDiscordComponentsArray(node.children) as any,
                    accent_color: node.props.color ? resolveColor(node.props.color) : undefined,
                    spoiler: node.props.spoiler,
                };
            default:
                return null;
        }
    }

    protected bufferOrStreamOrBlobFileName(stream: Buffer | Stream | Blob) {
        if (bufferOrStreamNameCache.has(stream)) return bufferOrStreamNameCache.get(stream)!;

        const name = v4();
        bufferOrStreamNameCache.set(stream, name);
        return name;
    }

    resolveAttachment(media: MediaItemResolvable): APIUnfurledMediaItem {
        if (typeof media === 'string') {
            return { url: media };
        }

        if ('url' in media) {
            return media;
        }

        if ('arrayBuffer' in media) {
            if ('name' in media) { // File
                this.attachments.set(media.name, media);
                return {
                    url: `attachment://${media.name}`
                };
            }

            if ('type' in media) { // Blob
                const name = `${this.bufferOrStreamOrBlobFileName(media)}.${mime.extension(media.type)}`;
                this.attachments.set(name, media);
                return {
                    url: `attachment://${name}`
                };
            }
        }
    
        this.attachments.set(media.name, media.attachment);
        return { url: `attachment://${media.name}` };
    }

    private asAPIMessageTopLevelComponent(node: InternalNode): APIMessageTopLevelComponent {
        const c = this.toDiscordComponent(node);
        if(!c) throw new Error();

        if(
            c.type === ComponentType.StringSelect
            || c.type === ComponentType.UserSelect
            || c.type === ComponentType.RoleSelect
            || c.type === ComponentType.MentionableSelect
            || c.type === ComponentType.ChannelSelect
            || c.type === ComponentType.Button
            || c.type === ComponentType.Thumbnail
            || c.type === ComponentType.TextInput
        ) {
            throw new Error();
        }

        return c as APIMessageTopLevelComponent;
    }

    private toDiscordButtonComponent(node: InstrinsicNodesMap["button"]): APIButtonComponent {
        const style = "skuId" in node.props ? ButtonStyle.Premium : (
            "url" in node.props ? ButtonStyle.Link : ({
                "primary": ButtonStyle.Primary,
                "secondary": ButtonStyle.Secondary,
                "success": ButtonStyle.Success,
                "danger": ButtonStyle.Danger,
            }[node.props.style || "primary"])
        );

        const custom_id = !("skuId" in node.props || "url" in node.props) ? (node.props.customId || this.createCustomId()) : undefined;
        if (custom_id && (node.props as DefaultButtonProps).onClick) this.eventHandlers.button.set(custom_id, (node.props as DefaultButtonProps).onClick as any);

        return {
            type: ComponentType.Button,
            style: style as any,
            label: this.getText(node),
            custom_id,
            sku_id: (node.props as PremiumButtonProps).skuId,
            url: (node.props as LinkButtonProps).url,
            disabled: node.props.disabled,
            emoji: node.props.emoji ? resolveEmoji(node.props.emoji) : undefined,
        };
    }

    private toDiscordSelectComponent(node: InstrinsicNodesMap["select"]): any {
        const custom_id = node.props.customId || this.createCustomId();
        if ((node.props as any).onSelect)
            this.eventHandlers.select.set(custom_id, (node.props as any).onSelect);

        return {
            type: {
                string: ComponentType.StringSelect,
                user: ComponentType.UserSelect,
                role: ComponentType.RoleSelect,
                mentionable: ComponentType.MentionableSelect,
                channel: ComponentType.ChannelSelect,
            }[node.props.type],
            custom_id,
            min_values: node.props.min,
            max_values: node.props.max,
            disabled: node.props.disabled,
            placeholder: node.props.placeholder,
            ...(node.props.type === "string" ? {
                options: node.children.map(child => ({
                    label: (child as InstrinsicNodesMap["option"]).props.label,
                    value: (child as InstrinsicNodesMap["option"]).props.value,
                    description: (child as InstrinsicNodesMap["option"]).props.description,
                    emoji: (child as InstrinsicNodesMap["option"]).props.emoji,
                    default: (node.props.defaultValues as string[] | undefined)?.includes((child as InstrinsicNodesMap["option"]).props.value),
                })),
            } : {}),
            ...(node.props.type === "user" || node.props.type === "role" ? {
                default_values: node.props.defaultValues?.map(id => ({ id, type: node.props.type })) as any,
            } : {}),
            ...(node.props.type === "mentionable" ? {
                default_values: node.props.defaultValues as any,
            } : {}),
            ...(node.props.type === "channel" ? {
                channel_types: node.props.channelTypes,
                default_values: node.props.defaultValues?.map(id => ({ id, type: "channel" })) as any,
            } : {}),
        };
    }

    private toDiscordTextInputComponent(node: InstrinsicNodesMap["text-input"]): APITextInputComponent {
        return {
            type: ComponentType.TextInput,
            custom_id: node.props.customId || this.createCustomId(),
            style: node.props.paragraph ? 2 : 1,
            label: node.props.label,
            required: node.props.required,
            placeholder: node.props.placeholder,
            value: node.props.value,
            min_length: node.props.min,
            max_length: node.props.max,
        };
    }
};
