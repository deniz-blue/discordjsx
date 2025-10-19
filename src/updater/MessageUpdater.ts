import { BaseMessageOptions, DiscordAPIError } from "discord.js";
import { MessageUpdateable, MessageUpdateData, updateTarget, getTargetMaxResponseTime, getTargetExpiration, deferTarget } from "./update-target.js";
import Mutex from "../utils/mutex.js";
import { debounceAsync } from "../utils/debounceAsync.js";
import { Timer } from "../utils/timer.js";
import { createNanoEvents } from "nanoevents";

export interface MessageUpdaterOptions {

};

export interface MessageUpdaterEventMap {
    expire: () => void;
    error: (e: Error) => void;
};

export class MessageUpdater {
    private target!: MessageUpdateable;

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

        const expirationTime = getTargetExpiration(target);
        if (expirationTime) this.expiryTimer.resetWithDelay(expirationTime);

        // TODO: what if target changes before noResponseTimer fires the callback?
        const replyMaxTime = getTargetMaxResponseTime(target);
        if (replyMaxTime) this.noResponseTimer.resetWithDelay(replyMaxTime);
    }

    // Deferring when too slow to render
    private noResponseTimer = new Timer(this.onNoResponse);
    private onNoResponse() {
        // deferTarget() does the check for !deferred && !replied
        deferTarget(this.target);
    }

    // Expiry

    private expiryTimer = new Timer(this.onExpire);
    private onExpire() {
        this.emitter.emit("expire");
    }
    isExpired() {
        return this.expiryTimer.ended;
    }

    // Updating

    private updateMutex = new Mutex();
    update = debounceAsync(this.updateImmediate, 300, this.updateMutex);
    async updateImmediate(payload: MessageUpdateData) {
        if (this.isExpired()) return;
        try {
            const newTarget = await updateTarget(this.target, payload);
            if (newTarget) this.setTarget(newTarget);
        } catch (e) {
            if (e instanceof DiscordAPIError && e.code == 10062) {
                this.expiryTimer.end();
            }

            const error = e instanceof Error ? e : new Error(String(e));
            this.emitter.emit("error", error);
        }
    }
};
