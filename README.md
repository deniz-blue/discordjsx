# discord-jsx-renderer

[![Discord](https://img.shields.io/discord/1197520507617153064?logo=discord)](https://deniz.blue/discord-invite?id=1197520507617153064)
[![Static Badge](https://img.shields.io/badge/view_on-github-blue?logo=github)](https://github.com/deniz-blue/discordjsx)
[![NPM Version](https://img.shields.io/npm/v/discord-jsx-renderer)](https://www.npmjs.com/package/discord-jsx-renderer)
[![NPM Last Update](https://img.shields.io/npm/last-update/discord-jsx-renderer)](https://www.npmjs.com/package/discord-jsx-renderer)
![GitHub Repo stars](https://img.shields.io/github/stars/deniz-blue/discordjsx)

Render react components for Discord interactions (Components V2 supported!)

You can use all sorts of react features including **state**, **context**, **effects** and more.

## Examples

![Screenshot](./examples/counter/screenshot.png)

**Code:**

```jsx
export const Counter = () => {
    const [count, setCount] = useState(0);

    return (
        <message v2 ephemeral>
            <container>
                <text>
                    Counter: **{count}**
                </text>
                <row>
                    <button
                        style="danger"
                        onClick={() => setCount(c => c - 1)}
                    >
                        -1
                    </button>
                    <button
                        style="success"
                        onClick={() => setCount(c => c + 1)}
                    >
                        +1
                    </button>
                </row>
            </container>
        </message>
    )
};
```

**More examples:**
- [TicTacToe (2 players)](https://github.com/deniz-blue/games-bot/blob/c3ce8f573ecdf194d45839fc3303cc8331beec0a/src/games/TicTacToe.tsx)
- [With react-router](https://github.com/deniz-blue/games-bot/blob/c3ce8f573ecdf194d45839fc3303cc8331beec0a/src/experiments/ReactRouterExperiment.tsx)

## Installation

Simply install `discord-jsx-renderer` and `react` with your package manager of choice:

```sh
npm add discord-jsx-renderer react
```

For types, install `pure-react-types`:

```sh
npm add --save-dev pure-react-types
```

Don't install `@types/react` because it has a lot of DOM/HTML types built in that make everything difficult.

Finally, you can add these to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["pure-react-types"],
    "lib": ["ESNext"],
  },
}
```

You *should* specify `lib` because the default value includes `"DOM"` so it pollutes your types.

## Usage

You should create a single `DJSXRendererManager` - it handles every instance of rendered responses to interactions and handles message component events.

```ts
import { DJSXRendererManager } from "discord-jsx-renderer";

export const djsx = new DJSXRendererManager();
```

On your `InteractionCreate` event, call `djsx.dispatchInteraction`. If you dont, you won't be able to use `onClick` or `onSelect`.

```ts
client.on(Events.InteractionCreate, (interaction: Interaction) => {
    djsx.dispatchInteraction(interaction);
});
```

Thats all you need for the setup.

To render a react component, simply call `djsx.create(target, element)`: 

```jsx
client.on(Events.InteractionCreate, (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    // Also do command handling logic etc.
    
    djsx.create(interaction, <MyComponent />);
});
```

```jsx
// or if youre using the discordjs.guide way
module.exports = {
    data: ...,
    async execute(interaction) {
        djsx.create(interaction, <MyComponent />);
    },
};
```

You can reply to almost all kinds of interactions or even pass a `Message` or any `Channel` to the first argument!

## Elements

See [docs/Elements.md](./docs/Elements.md) for a list of the built-in JSX elements you can use to structure your components.

## Features

### React Features

We have support for almost all of React 19 features. The ones we tested are:
- Hooks
- State
- Context
- FC

We are in the process of adding Suspense support.

Components can also re-render without any interaction event like so:

```tsx
const [counter, setCounter] = useState(0);

useEffect(() => {
    let i = setInterval(() => {
        setCounter(c => c + 1);
    }, 10 * 1000);
    return () => clearInterval(i);
}, []);

return (
    <text>
        {counter}
    </text>
);
```

### Event Handlers

Buttons and Selects can have inline event handlers:

```jsx
<button onClick={handler}>
    My Button
</button>
```

If they don't have an event handler or dont cause a re-render, `discord-jsx-renderer` calls `deferUpdate`

### Auto-Disabling

Any `Interaction` token is valid for up to **15 minutes**. `discord-jsx-renderer` will update the message to have every component disabled just before the interaction token expires for UX purposes.

You can also use the below snippet to disable components in rendered messages manually before exiting the nodejs process:

```js
const beforeExit = () => {
    djsx.disable()
        .catch(e => console.log(e))
        .finally(() => process.exit(0));
};

process.on("SIGTERM", beforeExit);
process.on("SIGINT", beforeExit);
```

## API

How does it work?

`discord-jsx-renderer` is compromised of 4 things:
- `reconciler` (`JSXRenderer`) is a custom react renderer that renders the jsx into our own internal structure and also handles other stuff such as effects/state/hooks managment, re-rendering, commits, scheduling etc.
- `PayloadBuilder` parses the output from reconciler and builds a discord payload to use for the REST API. It also collects all the event handlers attached to the JSX. *If you are going to use it, please make a new class per message/payload*
- `MessageUpdater` handles updating the message from all sorts of sources, it also keeps track of interaction expiry, handles unreplied interactions and handles disabling
- `DJSXRenderer` brings MessageUpdater, PayloadBuilder and reconciler together
- `DJSXRendererManager` manages multiple renderers and helps dispatch any new interaction events from the `discord.js` client to the renderer. You can use the renderer itself but you will need to handle dispatching interactions and cleanup yourself too.

**Custom Ids:** If you use the `customId` prop on a jsx element, the `onClick` will **not** work. This is because the renderer creates its own customId's when they are missing and the generated ones include a prefix identifying that renderer. This was done so that the renderer can use `interaction.deferUpdate` if the react component does not re-render to cause a reply to the message component interaction.

Generated customId's will be in the format of `djsx:A:B` where `A` is the UUID key of the renderer and B is a random UUID unique to the message component.

### Hot-Reloading

You can replace rendered nodes to have some sort of hot-reloading functionality.

```jsx
let node = <MyComponent />;
let renderer = new DJSXRenderer(interaction, node);

// Somehow get value of updated node
let newNode = <MyComponent />;
renderer.setNode(newNode);
```

## Known Issues

> AKA To-Do

- `<modal>`s are still in development
- Message v1 - `<embed>` not implemented yet
- Uploading files via components not supported yet
