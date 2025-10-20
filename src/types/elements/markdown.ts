import type { APIPartialEmoji, ApplicationCommand, Channel, GuildMember, Role, Snowflake, TimestampStylesString, User } from "discord.js";
import type { PropsWithChildren } from "react";

export interface IntrinsicMarkdownElements {
    u: PropsWithChildren & React.JSX.IntrinsicAttributes;
    b: PropsWithChildren & React.JSX.IntrinsicAttributes;
    i: PropsWithChildren & React.JSX.IntrinsicAttributes;
    s: PropsWithChildren & React.JSX.IntrinsicAttributes;
    code: PropsWithChildren & React.JSX.IntrinsicAttributes;
    pre: PropsWithChildren<{ language?: string }> & React.JSX.IntrinsicAttributes;
    ul: PropsWithChildren & React.JSX.IntrinsicAttributes;
    ol: PropsWithChildren & React.JSX.IntrinsicAttributes;
    li: PropsWithChildren & React.JSX.IntrinsicAttributes;
    h1: PropsWithChildren & React.JSX.IntrinsicAttributes;
    h2: PropsWithChildren & React.JSX.IntrinsicAttributes;
    h3: PropsWithChildren & React.JSX.IntrinsicAttributes;
    subtext: PropsWithChildren & React.JSX.IntrinsicAttributes;
    spoiler: PropsWithChildren & React.JSX.IntrinsicAttributes;
    a: PropsWithChildren<{ href: string, alt?: string }> & React.JSX.IntrinsicAttributes;
    emoji: APIPartialEmoji & React.JSX.IntrinsicAttributes;
    timestamp: {
        time: Date | number;
        format?: TimestampStylesString;
    } & React.JSX.IntrinsicAttributes;
    mention: ({
        user: User | Snowflake;
    } | {
        member: GuildMember | Snowflake; 
    } | {
        channel: Channel | Snowflake;
    } | {
        role: Role | Snowflake;
    } | {
        commandName?: string;
        subcommandGroupName?: string;
        subcommandName?: string;
        command: ApplicationCommand | Snowflake;
    }) & React.JSX.IntrinsicAttributes;
    br: React.JSX.IntrinsicAttributes;
    blockquote: PropsWithChildren & React.JSX.IntrinsicAttributes;
}
