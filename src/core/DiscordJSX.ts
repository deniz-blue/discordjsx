import { Collection, CommandInteraction, MessageComponentInteraction, Snowflake, SnowflakeUtil, type Interaction } from "discord.js";
import { Instance, InstanceHooks } from "../instance/Instance.js";
import { MessageUpdater } from "../updater/MessageUpdater.js";
import { InteractionEventHooks, PayloadBuilder, PayloadBuilderHooks } from "../payload/PayloadBuilder.js";
import { renderOnce } from "../reconciler/root.js";
import { createElement } from "react";
import { Wrapper, WrapperProps } from "./wrapper.js";
import { MessageUpdateable } from "../updater/update-target.js";
import { createErrorPayload, CreateErrorPayload } from "../internals.js";

export type ModalTarget =
    | CommandInteraction
    | MessageComponentInteraction

export type CreateCustomId = (instanceId: string, providedId?: string) => string;
export const defaultCreateCustomId: CreateCustomId = (instanceId, providedId) => {
    return `djsx::${instanceId}::${providedId || Math.random().toString(36)}`;
};

export class DiscordJSX {
    private instances: Collection<Snowflake, Instance> = new Collection();
    private listeners: Collection<string, Function> = new Collection();
    private instanceCustomIds: Collection<Snowflake, Set<string>> = new Collection();


    public createErrorPayload: CreateErrorPayload | null = createErrorPayload;
    public createCustomId: CreateCustomId = defaultCreateCustomId;


    // TODO
    private add = (customId: string, listener: Function) => {
        this.listeners.set(customId, listener);
    };
    private eventHooks: InteractionEventHooks = {
        addButtonEventListener: this.add,
        addModalSubmitEventListener: this.add,
        addSelectEventListener: this.add,
    };

    private blobFilenameCache = new WeakMap<Blob, string>();
    private getBlobFilename = (blob: Blob) => {
        if (this.blobFilenameCache.has(blob)) return this.blobFilenameCache.get(blob)!;
        const name = Math.random().toString(36).slice(2);
        this.blobFilenameCache.set(blob, name);
        return name;
    }

    public createMessage(
        target: MessageUpdateable,
        element: React.ReactNode,
    ) {
        const instanceId = SnowflakeUtil.generate().toString();
        this.instanceCustomIds.set(instanceId, new Set());

        const hooks: InstanceHooks = {
            ...this.eventHooks,
            createErrorPayload: this.createErrorPayload,
            getBlobFilename: this.getBlobFilename,
            createCustomId: (providedId) => {
                const customId = this.createCustomId(instanceId, providedId);
                this.instanceCustomIds.get(instanceId)?.add(customId);
                return customId;
            },
        };

        const updater = new MessageUpdater(target);
        const instance = new Instance(updater, hooks);
        this.instances.set(instanceId, instance);

        const props: WrapperProps = {
            context: {
                instanceId,
                instance,
            },
        };

        const wrappedElement = createElement(Wrapper, props, element);
        instance.root.setElement(wrappedElement);

        return instanceId;
    }

    public async createModal(
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

        return instanceId;
    }

    public dispatchInteraction(int: Interaction) {
        if (int.isMessageComponent() || int.isModalSubmit()) {
            const instanceId = this.instanceCustomIds.findKey(ids => ids.has(int.customId));
            if (instanceId) this.instances.get(instanceId)?.updater.setTarget(int);

            this.listeners.get(int.customId)?.(int);
        }
    }

    async disable() {

    }
}

export const djsx = new DiscordJSX();
