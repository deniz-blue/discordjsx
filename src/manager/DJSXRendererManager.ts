import { ChatInputCommandInteraction, Collection, ModalSubmitInteraction, type Interaction } from "discord.js";
import { DJSXMessageRenderer, DJSXModalRenderer, type DJSXRendererOptions } from "../renderer/index.js";
import type { ReactNode } from "react";
import type { MessageUpdateable } from "../updater/types.js";

export class DJSXRendererManager {
    renderers: Collection<string, DJSXMessageRenderer | DJSXModalRenderer> = new Collection();

    create(
        interaction: MessageUpdateable,
        node?: ReactNode,
        options?: DJSXRendererOptions,
    ) {
        const renderer = new DJSXMessageRenderer(
            interaction,
            node,
            options,
        );

        if (options?.interactible !== false) { 
            renderer.emitter.on("inactivity", () => {
                this.remove(renderer);
            });

            this.add(renderer);
        }

        return renderer;
    }

    async createModal(interaction: ChatInputCommandInteraction, node?: ReactNode) {
        const renderer = new DJSXModalRenderer(interaction, node);

        this.add(renderer);

        const promise = Promise.withResolvers<{
            form: Record<string, string>,
            interaction: ModalSubmitInteraction,
            timedOut?: undefined,
        } | { timedOut: true }>();
        
        renderer.on('error', err => promise.reject(err));
        renderer.on('modalResponded', (interaction, form) => promise.resolve({ form, interaction }));
        renderer.on('inactivity', () => {
            this.remove(renderer);
            promise.resolve({ timedOut: true });
        });

        return await promise.promise;
    }
    
    add(renderer: DJSXMessageRenderer | DJSXModalRenderer) {
        this.renderers.set(renderer.key, renderer);
    }

    remove(renderer: DJSXMessageRenderer | DJSXModalRenderer) {
        this.renderers.delete(renderer.key);
    }

    dispatchInteraction(int: Interaction) {
        for (const renderer of this.renderers.values()) {
            renderer.dispatchInteraction(int);
        }
    }

    disable() {
        return Promise.all(this.renderers.map((renderer) => 'disable' in renderer && renderer.disable()));
    }
}
