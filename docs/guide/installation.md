# Getting Started

## Installation

Install `discord-jsx-renderer` **and** `react` with your package manager of choice:

::: code-group

```sh [npm]
$ npm add discord-jsx-renderer react
```

```sh [pnpm]
$ pnpm add discord-jsx-renderer react
```

```sh [yarn]
$ yarn add discord-jsx-renderer react
```

:::

If you are using **TypeScript**, you should also read [TypeScript information](./typescript.md).

## Setup

You need to call `djsx.dispatchInteraction` with any new **interaction**s to be able to use [event handlers]().

If you already have an `Client#InteractionCreate` event handler, you can call it there - otherwise, you should add a listener.

```ts [index.ts]
import { djsx } from "discord-jsx-renderer";

client.on(Events.InteractionCreate, (interaction: Interaction) => {
    djsx.dispatchInteraction(interaction);
});
```

`dispatchInteraction` will only act on interactions that are 100% tied to components rendered by `discord-jsx-renderer`. It does not do anything to the provided interaction if it is unrelated.
