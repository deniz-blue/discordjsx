import { ColorResolvable } from "discord.js";
import { PropsWithChildren } from "react";

export interface ContainerProps extends PropsWithChildren {
    color?: ColorResolvable;
    spoiler?: boolean;
};
