import { BaseMessageOptions, DiscordAPIError } from "discord.js";
import { MessageUpdateable, MessageUpdateData, updateTarget, getTargetResponseDeadline, getTargetExpiration, deferTarget } from "./update-target.js";
import Mutex from "../utils/mutex.js";
import { debounceAsync } from "../utils/debounceAsync.js";
import { Timer } from "../utils/timer.js";
import { createNanoEvents } from "nanoevents";

const DEBUG = !!process.env.DISCORDJSX_DEBUG;

export interface MessageUpdaterOptions {
    replyLatency?: number;
};

export interface MessageUpdaterEventMap {
    expire: () => void;
    error: (e: Error, isReport?: boolean) => void;
    targetChange: (target: MessageUpdateable) => void;
};

export class MessageUpdater {
    private target!: MessageUpdateable;
    getTarget = () => this.target;

    // Events
    private emitter = createNanoEvents<MessageUpdaterEventMap>();
    on = <E extends keyof MessageUpdaterEventMap>(event: E, callback: MessageUpdaterEventMap[E]) =>
        this.emitter.on(event, callback);

    constructor(
        target: MessageUpdateable,
        readonly options?: MessageUpdaterOptions,
    ) {
        this.setTarget(target);
    }

    setTarget(target: MessageUpdateable) {
        this.target = target;
        this.emitter.emit("targetChange", target);

        const expirationTime = getTargetExpiration(target);
        if (expirationTime) this.expiryTimer.resetWithDelay(expirationTime);

        // TODO: what if target changes before noResponseTimer fires the callback?
        const deadline = getTargetResponseDeadline(target);
        if (deadline) this.noResponseTimer.resetWithDelay(deadline - (this.options?.replyLatency ?? 2000));
    }

    // Deferring when too slow to render
    private noResponseTimer = new Timer(this.onNoResponse.bind(this));
    private onNoResponse() {
        if (DEBUG) console.debug("Did not update in time, will attempt to defer", this.target);
        // deferTarget() does the check for !deferred && !replied
        this.updateMutex.runInMutex(async () => {
            await deferTarget(this.target);
        });
    }

    // Expiry

    private expiryTimer = new Timer(this.onExpire.bind(this));
    private onExpire() {
        this.emitter.emit("expire");
    }
    isExpired() {
        return this.expiryTimer.ended;
    }

    // Updating

    private updateMutex = new Mutex();
    update = debounceAsync(this.updateImmediate, 300, this.updateMutex);
    async updateImmediate(payload: MessageUpdateData, isReport?: boolean) {
        if (this.isExpired()) return;
        if (DEBUG) console.log(JSON.stringify({ category: "djsx/updater", payload }));
        try {
            const newTarget = await updateTarget(this.target, payload);
            this.noResponseTimer.stop();
            if (newTarget) this.setTarget(newTarget);
        } catch (e) {
            if (e instanceof DiscordAPIError && e.code == 10062) {
                this.expiryTimer.end();
            }

            if (DEBUG && e instanceof DiscordAPIError) {
                console.log(JSON.stringify({ category: "djsx/updater", rawError: e.rawError }));
            }

            const error = e instanceof Error ? e : new Error(String(e));
            this.emitter.emit("error", error, isReport);
        }
    }
};
