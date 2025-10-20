import { PropsWithChildren } from "react";
import { EventHandler } from "../events.js";

export interface MessageProps extends PropsWithChildren {
    v1?: boolean;
    ephemeral?: boolean;
}

export interface ModalProps extends PropsWithChildren {
    title: string;
    customId?: string;
    onSubmit?: EventHandler<ModalSubmitInteraction, any>;
}

export interface IntrinsicRootElements {
    message: MessageProps & React.JSX.IntrinsicAttributes;
    modal: ModalProps & React.JSX.IntrinsicAttributes;
}
