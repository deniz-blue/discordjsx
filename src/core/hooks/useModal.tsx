import { useCallback } from "react";
import { useInstance } from "../context.js";
import { djsx } from "../DiscordJSX.js";
import { BaseInteraction } from "discord.js";

export const useModal = () => {
    const { instanceId, instance } = useInstance();

    const open = useCallback((element: React.ReactNode) => {
        const target = instance.updater.getTarget();
        if(!(target instanceof BaseInteraction) || !target.isMessageComponent()) return;
        djsx.createModal(target, element, instanceId);
    }, []);

    return open;
};
