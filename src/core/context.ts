import { createContext, useContext } from "react";
import { Instance } from "../internals.js";

export interface InstanceContext {
    instanceId: string;
    instance: Instance;
};

export const InstanceContext = createContext<InstanceContext | null>(null);

export const useInstance = () => {
    const ctx = useContext(InstanceContext);
    if (!ctx) throw new Error("This hook can only be called inside a discord-jsx-renderer component");
    return ctx;
};
