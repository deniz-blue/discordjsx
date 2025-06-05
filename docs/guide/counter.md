# Counter

Lets build an example counter! This will teach you how to use React state and callbacks.

Assuming you have a slash command, `/counter`, lets create a handler and make it render our custom React component, `Counter`:

```tsx {5}
client.on(Events.InteractionCreate, (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    if(!interaction.commandName !== "counter") return;

    djsx.create(interaction, <Counter />);
});
```

Now, lets define `Counter` as a React function component:

```tsx
const Counter = () => {
    return (
        <message v2>
            <text>
                Hi!
            </text>
        </message>
    )
};
```

But we need to have a button, right? Lets add a button!

```tsx
const Counter = () => {
    return (
        <message v2>
            <text>
                Hi!
            </text>

            <button> // [!code ++]
                Increment // [!code ++]
            </button> // [!code ++]
        </message>
    )
};
```


