import type { APIMessageComponentEmoji, ButtonInteraction, EmojiResolvable } from "discord.js";
import { DJSXEventHandler } from "../events.js";
import { EventHandler } from "../../events.js";
import { PropsWithChildren } from "react";

export type ButtonStyle =
    | "primary"
    | "secondary"
    | "success"
    | "danger"

export type ButtonEmoji = EmojiResolvable | APIMessageComponentEmoji | string;

export interface ButtonProps extends PropsWithChildren {
    customId?: string;
    disabled?: boolean;
    /** A unicode emoji, or a formatted emoji mention, or an emoji ID, or an emoji object. */
    emoji?: ButtonEmoji;
    style?: ButtonStyle;
    onClick?: EventHandler<ButtonInteraction, void>;
    url?: string;
    skuId?: string;
};
