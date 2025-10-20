import { PropsWithChildren } from "react";

export interface LabelProps extends PropsWithChildren {
    label: string;
    description?: string;
};
