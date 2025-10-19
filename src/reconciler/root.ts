import type { HostContainer, InternalNode } from "./types.js";
import { createNanoEvents, Unsubscribe } from "nanoevents";
import { ConcurrentRoot } from "react-reconciler/constants.js";
import { reconciler } from "./reconciler.js";

export interface RootEventMap {
    render: (node: InternalNode | null) => void;
    error: (error: Error, info: React.ErrorInfo) => void;
};

export interface Root {
    on: <E extends keyof RootEventMap>(event: E, callback: RootEventMap[E]) => Unsubscribe;
    readonly node: InternalNode | null;
    setElement: (element: React.ReactNode) => void;
    unmount: () => void;
};

export const createRoot = (): Root => {
    const emitter = createNanoEvents<RootEventMap>();
    let node: InternalNode | null = null;
    const onRender = (rendered: InternalNode | null) => {
        node = rendered;
        emitter.emit("render", node);
    };

    const opaqueRoot = reconciler.createContainer(
        {
            onRenderContainer: onRender,
        } as HostContainer,
        ConcurrentRoot,
        null,
        false,
        null,
        "discord-jsx-renderer",
        (e, info) => emitter.emit("error", e, info),
        (e, info) => emitter.emit("error", e, info),
        (e, info) => emitter.emit("error", e, info),
        ()=>{},
        null
    );

    const setElement = (element: React.ReactNode) => {
        reconciler.updateContainer(
            element,
            opaqueRoot,
            null,
            () => {
                console.log("Callback!")
            },
        );
    };

    return {
        on: emitter.on.bind(emitter),
        setElement,
        unmount: () => setElement(null),
        get node() {
            return node;
        }
    };
};

export const renderOnce = (
    element: React.ReactNode,
): Promise<InternalNode> => {
    return new Promise((resolve, reject) => {
        const root = createRoot();
        root.on("render", (node) => {
            if (!node) return;
            resolve(node);
        });
        root.on("error", reject);
        root.setElement(element);
    });
};
