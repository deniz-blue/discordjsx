import { useInstance } from "./useInstance.js";
import { isMessageUpdateableInteraction, MessageUpdateableInteraction } from "../../internals.js";

export const useInteraction = (): MessageUpdateableInteraction | null => {
	const instance = useInstance();
	const target = instance.updater.getTarget();
	if (isMessageUpdateableInteraction(target)) return target;
	return null;
};
