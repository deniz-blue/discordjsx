import { useInstance } from "./useInstance.js";
import { isMessageUpdateableInteraction, MessageUpdateableInteraction } from "../../internals.js";

export const useInteraction = (): MessageUpdateableInteraction | null => {
    const instance = useInstance();
    const target = instance.updater.getTarget();
    if(isMessageUpdateableInteraction(target)) {
		console.log("useInteraction: Retrieved interaction target:", target);
		return target;
	};
	console.log("useInteraction: Target is not an interaction:", target);
    return null;
};
