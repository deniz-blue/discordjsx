import { Collection, CommandInteraction, MessageComponentInteraction, Snowflake, SnowflakeUtil, type Interaction } from "discord.js";
import type { MessageUpdateable } from "../updater/types.js";
import { Instance, InstanceHooks } from "../instance/Instance.js";
import { MessageUpdater } from "../updater/MessageUpdater.js";
import { createNanoEvents } from "nanoevents";
import { InteractionEventHooks, PayloadBuilder, PayloadBuilderHooks } from "../payload/PayloadBuilder.js";
import { renderOnce } from "../reconciler/root.js";
import { createElement } from "react";
import { Wrapper, WrapperProps } from "./wrapper.js";

export type ModalTarget =
    | CommandInteraction
    | MessageComponentInteraction

export class DiscordJSX {
    private instances: Collection<Snowflake, Instance> = new Collection();
    private listeners: Collection<string, Function> = new Collection();
    private instanceCustomIds: Collection<Snowflake, Set<string>> = new Collection();

    // TODO
    private add = (customId: string, listener: Function) => {
        this.listeners.set(customId, listener);
    };
    private eventHooks: InteractionEventHooks = {
        addButtonEventListener: this.add,
        addModalSubmitEventListener: this.add,
        addSelectEventListener: this.add,
    };

    // TODO: allow customization
    private createCustomId = (instanceId: string, providedId?: string) => {
        const customId = `djsx::${instanceId}::${providedId || Math.random().toString(36)}`;
        this.instanceCustomIds.get(instanceId)?.add(customId);
        return customId;
    }

    private blobFilenameCache = new WeakMap<Blob, string>();
    private getBlobFilename = (blob: Blob) => {
        if(this.blobFilenameCache.has(blob)) return this.blobFilenameCache.get(blob)!;
        const name = Math.random().toString(36).slice(2);
        this.blobFilenameCache.set(blob, name);
        return name;
    }

    createMessage(
        target: MessageUpdateable,
        element: React.ReactNode,
    ) {
        const instanceId = SnowflakeUtil.generate().toString();
        this.instanceCustomIds.set(instanceId, new Set());

        const hooks: InstanceHooks = {
            ...this.eventHooks,
            createCustomId: (providedId) =>
                this.createCustomId(instanceId, providedId),
            getBlobFilename: this.getBlobFilename,
        };

        const updater = new MessageUpdater(target);
        const instance = new Instance(updater, hooks);
        this.instances.set(instanceId, instance);

        const props: WrapperProps = {
            context: {
                instanceId,
            },
        };

        const wrappedElement = createElement(Wrapper, props, element);
        instance.root.setElement(wrappedElement);
    }

    async createModal(
        target: ModalTarget,
        element: React.ReactNode,
        instanceId = SnowflakeUtil.generate().toString(),
    ) {
        const hooks: PayloadBuilderHooks = {
            ...this.eventHooks,
            addAttachment() { },
            getBlobFilename: this.getBlobFilename,
            createCustomId: (providedId) =>
                this.createCustomId(instanceId, providedId),
        };

        const node = await renderOnce(element);
        const payload = PayloadBuilder.asModal(node as any, hooks);

        await target.showModal(payload);
    }

    dispatchInteraction(int: Interaction) {
        if (int.isMessageComponent() || int.isModalSubmit()) {
            this.listeners.get(int.customId)?.(int);

            const instanceId = this.instanceCustomIds.findKey(ids => ids.has(int.customId));
            if (instanceId) this.instances.get(instanceId)?.updater.setTarget(int);
        }
    }

    async disable() {

    }
}

export const djsx = new DiscordJSX();
