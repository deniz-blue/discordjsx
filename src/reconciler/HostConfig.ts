import type { HostConfig, OpaqueHandle, ReactContext } from 'react-reconciler';
import { DefaultEventPriority } from 'react-reconciler/constants.js';
import type { HostContainer, InternalChildSet, InternalNode } from './types.js';
import { createContext } from 'react';

const LOGGING_ENABLED = !!process.env.DISCORDJSX_HOST_CONFIG_LOGGING;

export type HostConfigProps = {
    Type: InternalNode['type'];
    Props: InternalNode['props'];
    Container: HostContainer;
    Instance: InternalNode;
    TextInstance: InternalNode & {
        type: '#text';
        props: {
            text: string;
        };
    };
    SuspenseInstance: InternalNode;
    HydratableInstance: never;
    FormInstance: never;
    PublicInstance: InternalNode;
    HostContext: Record<string, never>;
    ChildSet: InternalChildSet;
    TimeoutHandle: NodeJS.Timeout | number | undefined;
    NoTimeout: -1;
    TransitionStatus: null;
};

const NoEventPriority = 0;
const NO_CONTEXT: HostConfigProps['HostContext'] = {};

let currentUpdatePriority: number = NoEventPriority;

export const InternalHostConfig = logmixin<
    HostConfig<
        HostConfigProps['Type'],
        HostConfigProps['Props'],
        HostConfigProps['Container'],
        HostConfigProps['Instance'],
        HostConfigProps['TextInstance'],
        HostConfigProps['SuspenseInstance'],
        HostConfigProps['HydratableInstance'],
        HostConfigProps['FormInstance'],
        HostConfigProps['PublicInstance'],
        HostConfigProps['HostContext'],
        HostConfigProps['ChildSet'],
        HostConfigProps['TimeoutHandle'],
        HostConfigProps['NoTimeout'],
        HostConfigProps['TransitionStatus']
    >
>({
    // Properties
    isPrimaryRenderer: false,
    warnsIfNotActing: false,
    supportsMutation: false,
    supportsPersistence: true,
    supportsHydration: false,

    // Instance Creation
    createInstance(type, { children, key, ref, ...props }) {
        return {
            type,
            props,
            children: [],
        };
    },
    createTextInstance(text) {
        return {
            type: '#text',
            props: { text },
            children: [],
        };
    },
    shouldSetTextContent: () => false,
    appendInitialChild(parent, child) {
        parent.children.push(child);
    },

    // Instance Updates
    commitUpdate(node, type, prev, next, handle) {
        const { children, ref, ...props } = next;
        node.props = props;
    },
    commitTextUpdate(node, oldText, newText) {
        // console.log("commitTextUpdate", [node, oldText, newText])
        node.props.text = newText;
    },

    finalizeInitialChildren: () => false,

    // Suspense
    hideInstance(instance) {
        instance.hidden = true;
    },
    unhideInstance(instance, props) {
        instance.hidden = false;
    },
    hideTextInstance(instance) {
        instance.hidden = true;
    },
    unhideTextInstance(instance, props) {
        instance.hidden = false;
    },

    // Host Contexts
    getRootHostContext: () => NO_CONTEXT,
    getChildHostContext: () => NO_CONTEXT,

    // Refs
    getPublicInstance: (instance) => instance,

    // ??? - TypeScript wants these to be defined
    getInstanceFromNode: () => null,
    beforeActiveInstanceBlur: () => { },
    afterActiveInstanceBlur: () => { },
    detachDeletedInstance: () => { },
    prepareScopeUpdate: () => { },
    getInstanceFromScope: () => null,
    shouldAttemptEagerTransition: () => false,
    trackSchedulerEvent: () => { },
    resolveEventType: () => null,
    resolveEventTimeStamp: () => -1.1,
    requestPostPaintCallback: () => { },
    maySuspendCommit: () => false,
    preloadInstance: () => true, // true indicates already loaded
    startSuspendingCommit() { },
    suspendInstance() { },
    waitForCommitToBeReady: () => null,
    NotPendingTransition: null,
    HostTransitionContext: createContext<HostConfigProps['TransitionStatus']>(null) as unknown as ReactContext<null>,

    setCurrentUpdatePriority: (newPriority: number) => {
        currentUpdatePriority = newPriority;
    },
    getCurrentUpdatePriority: () => currentUpdatePriority,
    resolveUpdatePriority: () =>
        currentUpdatePriority !== NoEventPriority ? currentUpdatePriority : DefaultEventPriority,
    resetFormInstance() { },

    // Commit
    prepareForCommit: () => null,
    resetAfterCommit: () => { },
    preparePortalMount: () => { },

    // Scheduling
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    supportsMicrotasks: true,
    scheduleMicrotask: queueMicrotask,

    // Persistence
    cloneInstance(instance, type, oldProps, newProps, keepChildren, recyclableInstance) {
        return {
            type: type,
            props: { ...instance.props },
            children: keepChildren ? [...instance.children] : [...(recyclableInstance?.children ?? [])],
            hidden: instance.hidden,
        };
    },
    createContainerChildSet: (container) => ({ child: null }),
    appendChildToContainerChildSet: (childSet, child) => {
        childSet.child = child;
    },
    finalizeContainerChildren(container, newChildren) {
        // noop
    },
    replaceContainerChildren(container, newChildren) {
        container.onRenderContainer(newChildren.child);
    },
    cloneHiddenInstance(instance, type, props) {
        return {
            type: type,
            props: props,
            children: instance.children,
            hidden: true,
        };
    },
    cloneHiddenTextInstance(instance, text) {
        return {
            type: '#text',
            props: { text },
            children: instance.children,
            hidden: true,
        };
    },
});

function logmixin<T>(obj: T): T {
    if (!LOGGING_ENABLED) return obj;

    for (const key in obj) {
        if (typeof obj[key] === 'function') {
            const orig = obj[key];
            obj[key] = function (this: T, ...args: any[]) {
                console.log(({ category: "djsx/host", fn: key, args }));
                return orig.apply(this, args);
            } as any;
        }
    }

    return obj;
}
