export default class Mutex {
    private locked = false;

    /** Promise which, when resolved, should leave the mutex in an unlocked state */
    private promise: Promise<void> | undefined;

    get isLocked() {
        return this.locked;
    }

    async runInMutex(fn: () => void | PromiseLike<void>): Promise<void>;
    async runInMutex<T, A extends any[]>(fn: (this: T, ...args: A) => void | PromiseLike<void>, thisArg: T, args: A, stack?: Error): Promise<void>;
    async runInMutex<T, A extends any[]>(fn: (this: T, ...args: A) => void | PromiseLike<void>, thisArg?: T, args?: A, stack?: Error) {
        await this.acquireLock();
        await (this.promise = (async () => {
            try {
                await fn.apply(thisArg as T, args as A);
            } catch (e) {
                console.log("DEBUG_REMOVEME", e)
                if (e instanceof Error && stack) e.stack += "\n" + stack.stack;
                throw e;
            } finally {
                this.locked = false;
            }
        })());
    }

    private async acquireLock() {
        if (this.locked) {
            if (!this.promise) {
                throw new Error('Mutex is in an invalid state');
            }
            await this.promise;
            this.promise = undefined;
            if (this.locked) {
                throw new Error('Mutex is in an invalid state');
            }
        }

        this.locked = true;
    }
}