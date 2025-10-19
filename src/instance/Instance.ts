import { type AttachmentPayload } from "discord.js";
import { createRoot, Root, type InternalNode } from "../reconciler/index.js";
import { MessageUpdater } from "../updater/index.js";
import { PayloadBuilder, PayloadBuilderHooks } from "../payload/PayloadBuilder.js";
import { resolveFile } from "../utils/resolve.js";
import { createErrorPayload } from "../utils/error.js";

export interface InstanceHooks extends Omit<PayloadBuilderHooks, "addAttachment"> {};

export class Instance {
    root: Root;
    constructor(
        public readonly updater: MessageUpdater,
        public readonly hooks: InstanceHooks,
    ) {
        this.root = createRoot();
        this.root.on("render", this.onRootRender);
        this.root.on("error", this.onRootError);
        this.updater.on("error", this.onUpdateError);
        this.updater.on("expire", this.onTargetExpired);
    }

    private onRootRender = async (node: InternalNode | null) => {
        // TODO: render empty message maybe?
        if (!node) return;

        const flags = PayloadBuilder.getMessageFlags(node);
        let attachmentPromises: Promise<AttachmentPayload>[] = [];

        const hooks: PayloadBuilderHooks = {
            addAttachment: (name, data) => {
                // TODO: don't re-upload files from last message version
                attachmentPromises.push(resolveFile(data).then(buf => ({
                    name,
                    attachment: buf,
                })));
            },

            ...this.hooks,
            // // TODO
            // addButtonEventListener: () => { },
            // addModalSubmitEventListener: () => { },
            // addSelectEventListener: () => { },

            // // TODO
            // createCustomId: () => "",
            // getBlobFilename: () => "",
        };

        const components = node.children.map(child =>
            PayloadBuilder.asComponent(child as any, hooks));

        const files = await Promise.all(attachmentPromises);

        this.updater.update({
            components,
            files,
            flags,
        });
    }

    private onRootError = (error: Error) => {
        const createPayload = createErrorPayload;
        const payload = createPayload(error);
        this.updater.update(payload);
        // if this fails, onUpdateError will be called :3
        // no need for error catching here
    }

    private onUpdateError = (error: Error) => {
        // TODO: custom logging
        console.error(error);
    }

    private onTargetExpired = () => {
        // TODO: disabling components maybe?
    }
}
