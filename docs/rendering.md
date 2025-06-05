# Rendering JSX

To render some JSX or React components, use the `DJSXRenderer#create(target, element)` method.

`target` can be any of the following:
- Any [Interaction](https://discord.js.org/docs/packages/discord.js/14.19.3/Interaction:TypeAlias) except [AutocompleteInteraction](https://discord.js.org/docs/packages/discord.js/14.19.3/AutocompleteInteraction:Class)
  - If interaction has a message (in case of message component interactions) it will be updated.
  - If interaction does not have a message, discord-jsx-renderer will reply.
- [Message](https://discord.js.org/docs/packages/discord.js/14.19.3/Message:Class)
- [TextBasedChannel](https://discord.js.org/docs/packages/discord.js/14.19.3/TextBasedChannel:TypeAlias) or [User](https://discord.js.org/docs/packages/discord.js/14.19.3/User:Class)
  - Will send a message and keep updating it.

`element` is any JSX element.

```tsx
djsx.create(interaction, (
    <message>
        Hello {interaction.user}!
    </message>
))
```
