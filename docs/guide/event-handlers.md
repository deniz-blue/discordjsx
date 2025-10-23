[`ButtonInteraction`]: https://discord.js.org/docs/packages/discord.js/14.23.2/ButtonInteraction:Class

# Event Handlers

Just like with React, you can pass `onClick`, `onSelect` or `onSubmit` to elements to handle events.

## Button Events

You can use the `onClick` prop on `<button>` elements to attach a click event handler:

```tsx
export const Test = () => {
    return (
        <row>
            <button
                onClick={(interaction) => {
                    interaction.reply("You clicked the button!");
                }}
            >
                Click me!
            </button>
        </row>
    );
};
```

The first argument will be the [`ButtonInteraction`].

## Select Events

TODO: document (similar to button#onClick)

## Modal Events

Simply add an `onSubmit` prop to your `<modal>` element:

TODO
