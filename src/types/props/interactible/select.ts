import type { APISelectMenuOption, ChannelSelectMenuInteraction, ChannelType, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, Snowflake, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";
import type { PropsWithChildren } from "react";
import { EventHandler } from "../../events.js";

export interface BaseSelectProps {
    customId?: string;
    min?: number;
    max?: number;
    disabled?: boolean;
    placeholder?: string;
};

export interface StringSelectProps extends BaseSelectProps, PropsWithChildren {
    type: "string";
    defaultValues?: Snowflake[];
    onSelect?: EventHandler<StringSelectMenuInteraction, Snowflake[]>;
}

export interface UserSelectProps extends BaseSelectProps {
    type: "user";
    defaultValues?: Snowflake[];
    onSelect?: EventHandler<UserSelectMenuInteraction, Snowflake[]>;
};

export interface RoleSelectProps extends BaseSelectProps {
    type: "role";
    defaultValues?: Snowflake[];
    onSelect?: EventHandler<RoleSelectMenuInteraction, Snowflake[]>;
};

export interface MentionableSelectProps extends BaseSelectProps {
    type: "mentionable";
    defaultValues?: { id: Snowflake; type: "user" | "role" }[];
    onSelect?: EventHandler<MentionableSelectMenuInteraction, Snowflake[]>;
};

export interface ChannelSelectProps extends BaseSelectProps {
    type: "channel";
    channelTypes?: ChannelType[];
    defaultValues?: Snowflake[];
    onSelect?: EventHandler<ChannelSelectMenuInteraction, Snowflake[]>;
};

export type SelectProps = StringSelectProps | UserSelectProps | RoleSelectProps | MentionableSelectProps | ChannelSelectProps;

export type OptionProps = Omit<APISelectMenuOption, "default">;
