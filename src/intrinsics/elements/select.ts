import type { APISelectMenuOption, ChannelSelectMenuInteraction, ChannelType, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, Snowflake, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";
import type { BaseInteractableProps } from "./base.js";
import type { DJSXEventHandler } from "../events.js";
import type { PropsWithChildren } from "react";

export interface BaseSelectProps extends BaseInteractableProps {
    min?: number;
    max?: number;
    disabled?: boolean;
    placeholder?: string;
};

export interface StringSelectProps extends BaseSelectProps, PropsWithChildren {
    type: "string";
    defaultValues?: Snowflake[];
    onSelect?: DJSXEventHandler<Snowflake[], StringSelectMenuInteraction>;
}

export interface UserSelectProps extends BaseSelectProps {
    type: "user";
    defaultValues?: Snowflake[];
    onSelect?: DJSXEventHandler<Snowflake[], UserSelectMenuInteraction>;
};

export interface RoleSelectProps extends BaseSelectProps {
    type: "role";
    defaultValues?: Snowflake[];
    onSelect?: DJSXEventHandler<Snowflake[], RoleSelectMenuInteraction>;
};

export interface MentionableSelectProps extends BaseSelectProps {
    type: "mentionable";
    defaultValues?: { id: Snowflake; type: "user" | "role" }[];
    onSelect?: DJSXEventHandler<Snowflake[], MentionableSelectMenuInteraction>;
};

export interface ChannelSelectProps extends BaseSelectProps {
    type: "channel";
    channelTypes?: ChannelType[];
    defaultValues?: Snowflake[];
    onSelect?: DJSXEventHandler<Snowflake[], ChannelSelectMenuInteraction>;
};

export type SelectProps = StringSelectProps | UserSelectProps | RoleSelectProps | MentionableSelectProps | ChannelSelectProps;
