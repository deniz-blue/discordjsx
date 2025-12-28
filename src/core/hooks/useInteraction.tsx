import { BaseInteraction } from "discord.js";
import { useInstance } from "./useInstance.js";

export const useInteraction = () => {
    const instance = useInstance();
    const target = instance.updater.getTarget();
    if(target instanceof BaseInteraction) return target;
    return null;
};
