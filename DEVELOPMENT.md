# Development

## Project Architecture

Components:

- [src/reconciler](./src/reconciler)
  - React reconciler
- [class JSXRenderer](./src/renderer/DJSXRenderer.ts)
  - Renders JSX into a `HostContainer` which includes `InternalNode`s
- [class PayloadBuilder](./src/payload/PayloadBuilder.ts)
  - transforms an `InternalNode` into [`MessagePayloadOutput`](./src/payload/types.ts)
- [class MessageUpdater](./src/updater/MessageUpdater.ts)
  - Updates a target (`MessageUpdateable`) that might change
  - Takes in `BaseMessageOptions` payload
- [src/intrinsics](./src/intrinsics)
  - provides typescript types for IDE autocompletion
