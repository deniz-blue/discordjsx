import type { APISelectMenuOption, ColorResolvable } from "discord.js";
import type { PropsWithChildren } from "react";
import type { SelectProps } from "./select.js";
import type { ButtonProps } from "./button.js";
import { MediaItemResolvable } from "./base.js";
import { LabelProps } from "./label.js";
import { TextInputProps } from "./text-input.js";

export interface IntrinsicDiscordElements {
    message: PropsWithChildren<{
        v2?: boolean;
        ephemeral?: boolean;
    }> & React.JSX.IntrinsicAttributes;
    modal: PropsWithChildren<{
        title: string;
        customId?: string;
        onSubmit?: () => void;
    }> & React.JSX.IntrinsicAttributes;
}

export interface IntrinsicMessageComponents {
    // layout
    container: PropsWithChildren<{
        color?: ColorResolvable;
        spoiler?: boolean;
    }> & React.JSX.IntrinsicAttributes;
    row: PropsWithChildren & React.JSX.IntrinsicAttributes;
    section: PropsWithChildren & React.JSX.IntrinsicAttributes;
    accessory: PropsWithChildren & React.JSX.IntrinsicAttributes;
    label: PropsWithChildren<LabelProps> & React.JSX.IntrinsicAttributes;

    // interactive
    button: PropsWithChildren<ButtonProps> & React.JSX.IntrinsicAttributes;
    select: SelectProps & React.JSX.IntrinsicAttributes;
    option: Omit<APISelectMenuOption, "default"> & React.JSX.IntrinsicAttributes;

    'text-input': TextInputProps & React.JSX.IntrinsicAttributes;

    // content
    text: PropsWithChildren & React.JSX.IntrinsicAttributes;

    thumbnail: {
        media: MediaItemResolvable;
        description?: string;
        spoiler?: boolean;
    } & React.JSX.IntrinsicAttributes;

    gallery: PropsWithChildren & React.JSX.IntrinsicAttributes;
    'gallery-item': {
        media: MediaItemResolvable;
        description?: string | null;
        spoiler?: boolean;
    } & React.JSX.IntrinsicAttributes;

    file: {
        file: MediaItemResolvable;
        spoiler?: boolean;
    } & React.JSX.IntrinsicAttributes;

    separator: {
        divider?: boolean;
        spacing?: "sm" | "lg";
    } & React.JSX.IntrinsicAttributes;
}

export interface DJSXElements extends IntrinsicDiscordElements, IntrinsicMessageComponents { };
