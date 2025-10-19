import { Collection, type Interaction } from "discord.js";
import { DJSXRenderer_old, type DJSXRendererOptions } from "../instance/index.js";
import type { ReactNode } from "react";
import type { MessageUpdateable } from "../updater/types.js";
import { MessageUpdater_old } from "../updater/MessageUpdaterOld.js";

export class DJSXRendererManager {
    renderers: Collection<string, DJSXRenderer_old> = new Collection();

    create(
        interaction: MessageUpdateable,
        node?: ReactNode,
        options?: DJSXRendererOptions,
    ) {
        const renderer = new DJSXRenderer_old(
            interaction,
            node,
            options,
        );

        if (options?.interactible !== false) { 
            renderer.emitter.on("inactivity", () => {
                this.renderers.delete(renderer.key!);
            });

            this.add(renderer);
        }

        return renderer;
    }
    
    add(renderer: DJSXRenderer_old) {
        this.renderers.set(renderer.key, renderer);
    }

    _createNew(
        target: MessageUpdateable,
        node?: ReactNode,
    ) {
        let updater = new MessageUpdater_old(target, []);
    }

    dispatchInteraction(int: Interaction) {
        for (const renderer of this.renderers.values()) {
            renderer.dispatchInteraction(int);
        }
    }

    disable() {
        return Promise.all(this.renderers.map((renderer) => renderer.disable()));
    }
}
