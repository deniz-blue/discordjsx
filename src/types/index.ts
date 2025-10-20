import { IntrinsicRootElements } from "./elements/root-elements.js";
import { IntrinsicMessageComponents } from "./elements/message-components.js";
import { IntrinsicMarkdownElements } from "./elements/markdown.js";

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements extends IntrinsicRootElements, IntrinsicMessageComponents, IntrinsicMarkdownElements {}
            interface IntrinsicAttributes {
                key?: React.Key | null | undefined;
            }
        }
    }
}

export * from "./events.js"
export * from "./media.js"
export * from "./props/content/file.js"
export * from "./props/content/gallery-item.js"
export * from "./props/content/separator.js"
export * from "./props/content/thumbnail.js"
export * from "./props/interactible/button.js"
export * from "./props/interactible/select.js"
export * from "./props/interactible/text-input.js"
export * from "./props/layout/container.js"
export * from "./props/layout/label.js"
