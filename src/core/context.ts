import { createContext, useContext } from "react";

export interface InstanceContext {
    instanceId: string;
};

export const InstanceContext = createContext<InstanceContext | null>(null);

export const useInstance = () => {
    const ctx = useContext(InstanceContext);
    if (!ctx) throw new Error("This hook can only be called inside a discord-jsx-renderer component");
    return ctx;
};
