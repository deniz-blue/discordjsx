import Mutex from "./mutex.js";

/**
 * Debounce calls to an async function. This function makes several useful assurances:
 * 
 * - If the function is called again before the timeout, the timeout is reset.
 * - If the callback is mid-execution when the function is called again, it will be queued.
 * - If there is already an entry in the queue, it will be replaced.
 * - At most one callback will be executed at a given time.
 *
 * @param fn The callback
 * @param ms Duration in milliseconds to wait for (at least) before executing the callback
 * @returns The debounced function
 */
export function debounceAsync<F extends (this: This, ...args: Args) => PromiseLike<void>, This, Args extends any[]>(fn: F, ms = 300, mutex = new Mutex()): F {
    let timeoutId: NodeJS.Timeout;
    let next: [This, Args, Error] | undefined;

    async function execute(thisArg: This, args: Args, stack: Error) {
        // v8 engine seems to be good at garbage collecting unresolvable promises?
        await new Promise(resolve => {
            timeoutId = setTimeout(resolve, ms);
        });

        await mutex.runInMutex(fn, thisArg, args, stack);

        if(next) {
            void execute(...next);
            next = undefined;
        }
    }

    return function (this: This, ...args: Args) {
        const stack = new Error("debounceAsync stack");

        if (mutex.isLocked) {
            next = [this, args, stack];
            return;
        }

        clearTimeout(timeoutId);
        void execute(this, args, stack);
        // timeoutId = setTimeout(async function execute(thisArg: This, args: Args, stack: Error) {
        //     await mutex.runInMutex(fn, thisArg, args, stack);

        //     if (next) {
        //         timeoutId = setTimeout(execute, ms, ...next);
        //         next = undefined;
        //     }
        // }, ms, this, args, callSiteError);
    } as F;
}
