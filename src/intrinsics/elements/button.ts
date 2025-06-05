import type { APIMessageComponentEmoji, ButtonInteraction, EmojiResolvable } from "discord.js";
import type { BaseInteractableProps } from "./base.js";
import { DJSXEventHandler } from "../events.js";

export interface BaseButtonProps extends BaseInteractableProps {
    disabled?: boolean;
    /** A unicode emoji, or a formatted emoji mention, or an emoji ID, or an emoji object. */
    emoji?: EmojiResolvable | APIMessageComponentEmoji | string;
};

export interface DefaultButtonProps extends BaseButtonProps {
    style?: "primary" | "secondary" | "success" | "danger";
    onClick?: DJSXEventHandler<void, ButtonInteraction>;
};

export interface LinkButtonProps extends BaseButtonProps {
    url: string;
};

export interface PremiumButtonProps extends BaseButtonProps {
    skuId: string;
};

export type ButtonProps = DefaultButtonProps | LinkButtonProps | PremiumButtonProps;
