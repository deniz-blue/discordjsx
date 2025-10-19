import { Collection, Snowflake, SnowflakeUtil, type Interaction } from "discord.js";
import type { MessageUpdateable } from "../updater/types.js";
import { Instance, InstanceHooks } from "../instance/Instance.js";
import { MessageUpdater } from "../updater/MessageUpdater.js";

export class DiscordJSX {
    private instances: Collection<Snowflake, Instance> = new Collection();

    constructor() { }

    createMessage(
        target: MessageUpdateable,
        element: React.ReactNode,
    ) {
        const id = SnowflakeUtil.generate().toString();

        const hooks: InstanceHooks = {
            // TODO
            addButtonEventListener: () => {},
            addModalSubmitEventListener: () => {},
            addSelectEventListener: () => {},

            // TODO: is this ... everything i need to do
            createCustomId: (providedId) =>
                `djsx::${id}::${providedId || Math.random().toString(36)}`,

            // TODO
            getBlobFilename(blob) {
                return "";
            },
        };

        const updater = new MessageUpdater(target);
        const instance = new Instance(updater, hooks);
        this.instances.set(id, instance);

        instance.root.setElement(element);
    }

    dispatchInteraction(int: Interaction) {

    }

    async disable() {

    }
}
