import { useInternal } from "../context.js";

/**
 * Hook to access the current DiscordJSX instance
 * @returns The current DiscordJSX instance
 */
export const useInstance = () => {
    const { instance } = useInternal();
    return instance;
}
