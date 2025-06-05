# Getting Started

Here's how you can start using React for your existing discord.js bot projects

This guide assumes you already have a discord.js project and you're already using TypeScript

## Installation

Simply install `discord-jsx-renderer` and `react` with your package manager of choice:

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

## TypeScript Types

`discord-jsx-renderer` is written in TypeScript and comes pre-packaged with types.
These types also include the JSX elements, however the `@types/react` library exports
a bunch of HTML related types that will make development worse.

We have created another package, `pure-react-types` to fix this issue. It is the same as `@types/react` but just does not have HTML/DOM related types.

::: code-group

```sh [npm]
$ npm add --save-dev pure-react-types
```

```sh [pnpm]
$ pnpm add --save-dev pure-react-types
```

```sh [yarn]
$ yarn add --save-dev pure-react-types
```

:::

You should also tweak your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["pure-react-types"],
    "lib": ["ESNext"],
  },
}
```

- `"jsx": "react-jsx"`: Allows you to use JSX
- `"types": ["pure-react-types"]`: Pulls react types from our library
- `"lib": ["ESNext"]`: Override `lib` because the default value includes `"DOM"`, which we dont want

## DJSXRendererManager

You should create a single `DJSXRendererManager` - it handles every instance of rendered responses to interactions and handles message component events.

```tsx:line-numbers [djsx.tsx]
import { DJSXRendererManager } from "discord-jsx-renderer";

export const djsx = new DJSXRendererManager();
```

On your `InteractionCreate` event, call `djsx.dispatchInteraction`.

```ts [index.ts]
client.on(Events.InteractionCreate, (interaction: Interaction) => {
    djsx.dispatchInteraction(interaction);
});
```

If you dont do this, you won't be able to use `onClick` or `onSelect` on some JSX components.
