import { Collection, Snowflake, SnowflakeUtil, type Interaction } from "discord.js";
import type { MessageUpdateable } from "../updater/types.js";
import { Instance, InstanceHooks } from "../instance/Instance.js";
import { MessageUpdater } from "../updater/MessageUpdater.js";
import { createNanoEvents } from "nanoevents";

export class DiscordJSX {
    private instances: Collection<Snowflake, Instance> = new Collection();
    private listeners = createNanoEvents();
    private instanceCustomIds: Collection<Snowflake, Set<string>> = new Collection();

    constructor() { }

    createMessage(
        target: MessageUpdateable,
        element: React.ReactNode,
    ) {
        const instanceId = SnowflakeUtil.generate().toString();
        this.instanceCustomIds.set(instanceId, new Set());

        const on = this.listeners.on.bind(this.listeners);
        const hooks: InstanceHooks = {
            // TODO
            addButtonEventListener: on,
            addModalSubmitEventListener: on,
            addSelectEventListener: on,

            // TODO: is this ... everything i need to do
            createCustomId: (providedId) => {
                const customId = `djsx::${instanceId}::${providedId || Math.random().toString(36)}`;
                this.instanceCustomIds.get(instanceId)?.add(customId);
                return customId;
            },

            // TODO
            getBlobFilename(blob) {
                return "";
            },
        };

        const updater = new MessageUpdater(target);
        const instance = new Instance(updater, hooks);
        this.instances.set(instanceId, instance);

        instance.root.setElement(element);
    }

    dispatchInteraction(int: Interaction) {
        if (int.isMessageComponent()) {
            this.listeners.emit(int.customId, int);

            console.log("DING DING DING", int.customId);

            const instanceId = this.instanceCustomIds.findKey(ids => ids.has(int.customId));
            if (instanceId) this.instances.get(instanceId)?.updater.setTarget(int);
        }

    }

    async disable() {

    }
}
