# Rendering a Message

When you're rendering JSX, your top level element should be a `message`. If you're not using [Components V2](https://discord.com/developers/docs/components/overview), you can add children as text:

```jsx
djsx.create(interaction, (
    <message>
        Legacy Components V1 message!
    </message>
))
```

You should set the `v2` prop to `true` if you want to use Components V2 elements:

```jsx {2}
djsx.create(interaction, (
    <message v2>
        <text>
            Hello world!
        </text>
    </message>
))
```

You cannot just add text content to a Components V2 message, so you need to use a `<text>` element.

## Ephemeral

If you want to create ephemeral messages, set the `ephemeral` prop to true.

```jsx {2}
djsx.create(interaction, (
    <message v2 ephemeral>
        <text>
            This message will only show up for you.
        </text>
    </message>
))
```

Keep in mind that these two props **cannot be changed** at a later time.
