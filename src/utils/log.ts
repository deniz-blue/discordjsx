export type ILogger = (level: 'message' | 'warn' | 'error' | 'trace', category: string, message: string, ...args: any[]) => void;

export const defaultLog: ILogger = (level, category, message, ...args) => {
    switch (level) {
        case 'message':
            console.log(`[${category}] ${message}`, ...args);
            break;
        case 'warn':
            console.warn(`[${category}] ${message}`, ...args);
            break;
        case 'error':
            console.error(`[${category}] ${message}`, ...args);
            break;
    }
}
