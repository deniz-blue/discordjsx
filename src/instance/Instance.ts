import { type AttachmentPayload } from "discord.js";
import { createRoot, Root, type InternalNode } from "../reconciler/index.js";
import { MessageUpdater } from "../updater/index.js";
import { PayloadBuilder, PayloadBuilderHooks } from "../payload/PayloadBuilder.js";
import { resolveFile } from "../utils/resolve.js";
import { createErrorPayload } from "../utils/error.js";

export interface InstanceHooks extends Omit<PayloadBuilderHooks, "addAttachment"> { };

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

    // Error Handling

    private reportError(error: Error, info?: React.ErrorInfo) {
        console.error(error, info);
        const createPayload = createErrorPayload;
        const payload = createPayload(error, info);
        this.updater.update(payload, true);
    }

    private onRootError = (error: Error, info: React.ErrorInfo) => {
        this.reportError(error, info);
    }

    private onUpdateError = (error: Error, isReport?: boolean) => {
        if (!isReport) {
            return this.reportError(error);
        }

        console.error("Error while reporting an error....");
        console.error(error);
    }

    private onTargetExpired = () => {
        // TODO: disabling components maybe?
    }
}
