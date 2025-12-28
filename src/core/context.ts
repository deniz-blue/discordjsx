import { createContext, useContext } from "react";
import { Instance } from "../internals.js";

export interface InternalContext {
    instanceId: string;
    instance: Instance;
};

export const InternalContext = createContext<InternalContext | null>(null);

export const useInternal = () => {
    const ctx = useContext(InternalContext);
    if (!ctx) throw new Error("This hook can only be called inside a discord-jsx-renderer component");
    return ctx;
};
