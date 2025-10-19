import type {
    AnySelectMenuInteraction,
    APIActionRowComponent,
    APIButtonComponent,
    APIComponentInActionRow,
    APIContainerComponent,
    APIFileComponent,
    APILabelComponent,
    APIMediaGalleryComponent,
    APIMediaGalleryItem,
    APIModalInteractionResponseCallbackData,
    APISectionAccessoryComponent,
    APISectionComponent,
    APISelectMenuComponent,
    APISeparatorComponent,
    APITextDisplayComponent,
    APITextInputComponent,
    APIThumbnailComponent,
    BufferResolvable,
    ButtonInteraction,
    CacheType,
    ModalSubmitInteraction,
    Snowflake,
} from "discord.js";
import { ButtonStyle, ComponentType, MessageFlags, resolveColor } from "discord.js";
import type { InternalNode } from "../reconciler/index.js";
import type { DJSXEventHandler } from "../intrinsics/index.js";
import type { LinkButtonProps, PremiumButtonProps } from "../intrinsics/elements/button.js";
import type { MediaItemResolvable } from "../intrinsics/index.js";
import type Stream from "node:stream";
import { resolveEmoji } from "../utils/resolve.js";
import mime from 'mime-types';
import { getNodeText } from "./markdown.js";

type TypedNode = {
    [K in keyof React.JSX.IntrinsicElements]: {
        type: K;
        props: React.JSX.IntrinsicElements[K];
        children: TypedNode[];
    };
}[keyof React.JSX.IntrinsicElements];

export type PayloadBuilderHooks = {
    createCustomId: (providedId?: string) => string;
    addButtonEventListener: (customId: string, listener: (interaction: ButtonInteraction<CacheType>) => void) => void;
    addSelectEventListener: (customId: string, listener: DJSXEventHandler<Snowflake[], AnySelectMenuInteraction>) => void;
    addModalSubmitEventListener: (customId: string, listener: DJSXEventHandler<Record<string, string>, ModalSubmitInteraction>) => void;
    addAttachment: (name: string, data: File | Blob | BufferResolvable | Stream) => void;
    getBlobFilename: (blob: Blob) => string;
};

export class PayloadBuilder {
    static getMessageFlags(node: InternalNode) {
        let flags: MessageFlags[] = [];

        if (node.type == "message") {
            if (!node.props.v1) flags.push(MessageFlags.IsComponentsV2);
            if (node.props.ephemeral) flags.push(MessageFlags.Ephemeral);
        }

        return flags;
    }

    static asModal(node: TypedNode, hooks: PayloadBuilderHooks) {
        if(node.type !== "modal") throw new Error("INVALID_NODE_TYPE");
        const customId = hooks.createCustomId(node.props.customId);

        if (node.props.onSubmit)
            hooks.addModalSubmitEventListener(customId, node.props.onSubmit);

        return {
            title: node.props.title,
            custom_id: customId,
            components: node.children.map(child => this.asComponent(child, hooks)),
        } satisfies APIModalInteractionResponseCallbackData;
    }

    static getUnfurledMediaItem(media: MediaItemResolvable, hooks: PayloadBuilderHooks) {
        if (typeof media === 'string')
            return { url: media };

        if ('url' in media)
            return media;

        if ('arrayBuffer' in media) {
            if ('name' in media) { // File
                hooks.addAttachment(media.name, media);
                return { url: `attachment://${media.name}` };
            }

            if ('type' in media) { // Blob
                const name = `${hooks.getBlobFilename(media)}.${mime.extension(media.type)}`;
                hooks.addAttachment(name, media);
                return { url: `attachment://${name}` };
            }
        }

        hooks.addAttachment(media.name, media.attachment);
        return { url: `attachment://${media.name}` };
    }

    static asComponent(node: TypedNode, hooks: PayloadBuilderHooks): any {
        switch (node.type) {
            case "row":
                return this.asActionRow(node, hooks);
            case "button":
                return this.asButton(node, hooks);
            case "select":
                return this.asSelect(node, hooks);
            case "text-input":
                return this.asTextInput(node, hooks);
            case "section":
                return this.asSection(node, hooks);
            case "text-input":
                return this.asTextInput(node, hooks);
            case "thumbnail":
                return this.asThumbnail(node, hooks);
            case "gallery":
                return this.asMediaGallery(node, hooks);
            case "gallery-item":
                return this.asMediaGalleryItem(node, hooks);
            case "file":
                return this.asFile(node, hooks);
            case "separator":
                return this.asSeparator(node, hooks);
            case "container":
                return this.asContainer(node, hooks);
            case "label":
                return this.asLabel(node, hooks);
            case "text":
                return this.asTextDisplay(node, hooks);
            default:
                throw new Error("NOT_A_COMPONENT");
        }
    }

    static asActionRow<T extends APIComponentInActionRow>(node: TypedNode, hooks: PayloadBuilderHooks) {
        return {
            type: ComponentType.ActionRow,
            components: node.children
                .map(child => this.asComponent(child, hooks))
                .filter(Boolean),
        } satisfies APIActionRowComponent<T>;
    }

    static asTextInput(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "text-input") throw new Error("INVALID_NODE_TYPE");
        const customId = hooks.createCustomId(node.props.customId);
        return {
            type: ComponentType.TextInput,
            custom_id: customId,
            style: node.props.paragraph ? 2 : 1,
            max_length: node.props.max,
            min_length: node.props.min,
            value: node.props.value,
            required: node.props.required,
            placeholder: node.props.placeholder,
        } satisfies APITextInputComponent;
    }

    static asButton(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "button") throw new Error("INVALID_NODE_TYPE");

        const customId = hooks.createCustomId(node.props.customId);
        if ("onClick" in node.props && node.props.onClick)
            hooks.addButtonEventListener(customId, node.props.onClick);

        const style = "skuId" in node.props ? ButtonStyle.Premium : (
            "url" in node.props ? ButtonStyle.Link : ({
                "primary": ButtonStyle.Primary,
                "secondary": ButtonStyle.Secondary,
                "success": ButtonStyle.Success,
                "danger": ButtonStyle.Danger,
            }[node.props.style || "primary"])
        );

        return {
            type: ComponentType.Button,
            custom_id: customId,
            label: getNodeText(node),
            style,
            sku_id: (node.props as PremiumButtonProps).skuId,
            url: (node.props as LinkButtonProps).url,
            disabled: node.props.disabled,
            emoji: node.props.emoji ? resolveEmoji(node.props.emoji) : undefined,
        } satisfies APIButtonComponent;
    }

    static asSelect(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "select") throw new Error("INVALID_NODE_TYPE");

        const customId = hooks.createCustomId(node.props.customId);
        if ("onSelect" in node.props && node.props.onSelect)
            hooks.addSelectEventListener(customId, node.props.onSelect as any); // TODO: types

        return {
            type: {
                string: ComponentType.StringSelect as const,
                user: ComponentType.UserSelect as const,
                role: ComponentType.RoleSelect as const,
                mentionable: ComponentType.MentionableSelect as const,
                channel: ComponentType.ChannelSelect as const,
            }[node.props.type],
            custom_id: customId,
            min_values: node.props.min,
            max_values: node.props.max,
            disabled: node.props.disabled,
            placeholder: node.props.placeholder,
            ...(node.props.type === "string" ? {
                options: node.children.map((child) => {
                    if (child.type !== "option") throw new Error("INVALID_NODE_TYPE");
                    return {
                        label: child.props.label,
                        value: child.props.value,
                        description: child.props.description,
                        emoji: child.props.emoji,
                        default: (node.props.defaultValues)?.some(x => (typeof x == "string" ? x : x.id) == child.props.value),
                    };
                }),
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
        } as APISelectMenuComponent;
    }

    static asSection(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "select") throw new Error("INVALID_NODE_TYPE");
        const nonAccessory = node.children.filter(x => x.type !== "accessory");

        const accessoryNode = node.children.find(x => x.type === "accessory")?.children[0];
        if (!accessoryNode) throw new Error("ACCESSORY_MISSING");

        const accessory = this.asSectionAccessory(accessoryNode, hooks);

        return {
            type: ComponentType.Section,
            components: nonAccessory.map(child => this.asComponent(child, hooks)).filter(Boolean),
            accessory,
        } satisfies APISectionComponent;
    }

    static asSectionAccessory(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "button" && node.type !== "thumbnail")
            throw new Error("INVALID_ACCESSORY");
        return this.asComponent(node, hooks) as APISectionAccessoryComponent;
    }

    static asTextDisplay(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "text") throw new Error("INVALID_NODE_TYPE");

        return {
            type: ComponentType.TextDisplay,
            content: getNodeText(node),
        } satisfies APITextDisplayComponent;
    }

    static asThumbnail(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "thumbnail") throw new Error("INVALID_NODE_TYPE");

        return {
            type: ComponentType.Thumbnail,
            media: this.getUnfurledMediaItem(node.props.media, hooks),
            description: node.props.description,
            spoiler: node.props.spoiler,
        } satisfies APIThumbnailComponent;
    }

    static asMediaGallery(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "gallery") throw new Error("INVALID_NODE_TYPE");

        return {
            type: ComponentType.MediaGallery,
            items: node.children.map(child => this.asMediaGalleryItem(child, hooks)),
        } satisfies APIMediaGalleryComponent;
    }

    static asMediaGalleryItem(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "gallery-item") throw new Error("INVALID_NODE_TYPE");

        return {
            media: this.getUnfurledMediaItem(node.props.media, hooks),
            description: node.props.description,
            spoiler: node.props.spoiler,
        } satisfies APIMediaGalleryItem;
    }

    static asFile(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "file") throw new Error("INVALID_NODE_TYPE");

        return {
            type: ComponentType.File,
            spoiler: node.props.spoiler,
            file: this.getUnfurledMediaItem(node.props.file, hooks),
        } satisfies APIFileComponent;
    }

    static asSeparator(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "separator") throw new Error("INVALID_NODE_TYPE");

        return {
            type: ComponentType.Separator,
            divider: node.props.divider,
            spacing: typeof node.props.spacing == "number" ? node.props.spacing : ({
                sm: 1,
                lg: 2,
                "": undefined,
            }[node.props.spacing ?? ""]),
        } satisfies APISeparatorComponent;
    }


    static asContainer(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "container") throw new Error("INVALID_NODE_TYPE");

        return {
            type: ComponentType.Container,
            components: node.children.map(child => this.asComponent(child, hooks)),
            accent_color: (node.props.color !== undefined) ? resolveColor(node.props.color) : undefined,
            spoiler: node.props.spoiler,
        } satisfies APIContainerComponent;
    }


    static asLabel(node: TypedNode, hooks: PayloadBuilderHooks) {
        if (node.type !== "label") throw new Error("INVALID_NODE_TYPE");

        return {
            type: ComponentType.Label,
            component: this.asComponent(node.children[0], hooks),
            label: node.props.label,
            description: node.props.description,
        } satisfies APILabelComponent;
    }
};
