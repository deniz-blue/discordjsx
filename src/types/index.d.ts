import { IntrinsicRootElements } from "./elements/root-elements.d.ts";
import { IntrinsicMessageComponents } from "./elements/message-components.d.ts";
import { IntrinsicMarkdownElements } from "./elements/markdown.d.ts";

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

export * from "./events.d.ts"
export * from "./media.d.ts"
export * from "./props/content/file.d.ts"
export * from "./props/content/gallery-item.d.ts"
export * from "./props/content/separator.d.ts"
export * from "./props/content/thumbnail.d.ts"
export * from "./props/interactible/button.d.ts"
export * from "./props/interactible/select.d.ts"
export * from "./props/interactible/text-input.d.ts"
export * from "./props/layout/container.d.ts"
export * from "./props/layout/label.d.ts"
