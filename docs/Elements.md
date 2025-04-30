# Elements

- [Elements](#elements)
  - [Root Elements](#root-elements)
    - [message](#message)
  - [Layout Elements](#layout-elements)
    - [container](#container)
    - [row](#row)
    - [section](#section)
  - [Interactive Elements](#interactive-elements)
    - [button](#button)
    - [select](#select)
  - [Content Elements](#content-elements)
    - [text](#text)
    - [separator](#separator)
    - [thumbnail](#thumbnail)
    - [gallery](#gallery)
    - [file](#file)

---

## Root Elements

### message

| prop       | type      | description          |
|------------|-----------|----------------------|
| ephemeral? | `boolean` | Make reply ephemeral |
| v2?        | `boolean` | Use Components v2    |

Children can be;
- If not `v2`: text content
- If `v2`: 

```jsx
<message>
    This is a normal message component! {"\n"}
    You can use {"JSX"} inside.
</message>

<message v2>
    <text>
        This one uses ComponentsV2!
    </text>
</message>
```

---

## Layout Elements

### container

| prop     | type                | description            |
|----------|---------------------|------------------------|
| color?   | [`ColorResolvable`] | Container accent color |
| spoiler? | `boolean`           |                        |

Children can be (up to 10 max):
- [`<row>`](#row)
- [`<text>`](#text)
- [`<section>`](#section)
- [`<gallery>`](#gallery)
- [`<separator>`](#separator)
- [`<file>`](#file)

### row

Action Row component

Children can be:
- up to 5 [`<button>`](#button)s
- a single [`<select>`](#select)
- a single [`<textInput>`](#button) (only if inside `<modal>`)

### section

```tsx
<section>
    <accessory>
        {/* <thumbnail> or <button> */}
    </accessory>
    {/* components... */}
</section>
```

Children must have a single `<accessory>` element which must have [`<thumbnail>`](#thumbnail) or [`<button>`](#button)

Children can also have:
- up to three [`<text>`](#text)s

```tsx
// Example
<section>
    <text>
        Check out latest news
    </text>

    <accessory>
        <button
            onClick={showNews}
        >
            News
        </button>
    </accessory>
</section>
```

---

## Interactive Elements

### button

Children will become button **label**

| prop      | type                                                | description                                |
|-----------|-----------------------------------------------------|--------------------------------------------|
| onClick?  | `(`[`ButtonInteraction`]`) => void`                 | click event                                |
| style?    | `"primary" \| "secondary" \| "success" \| "danger"` | style if normal button                     |
| disabled? | `boolean`                                           | disabled state                             |
| url?      | `string`                                            | if specified, will become a link button    |
| skuId?    | `string`                                            | if specified, will become a premium button |
| customId? | `string`                                            | experimental                               |

### select

Children are not allowed

| prop           | type                                                          | description                                      |
|----------------|---------------------------------------------------------------|--------------------------------------------------|
| type           | `"string" \| "user" \| "role" \| "mentionable" \| "channel"`  | Select component type                            |
| onSelect?      | `(`[`Snowflake`]`[], `[`AnySelectMenuInteraction`]`) => void` | interaction type is derived from `type` prop     |
| min?           | `number`                                                      | minimum amount                                   |
| max?           | `number`                                                      | maximum amount                                   |
| disabled?      | `boolean`                                                     | disabled state                                   |
| placeholder?   | `string`                                                      |                                                  |
| options?       | `Omit<`[`APISelectMenuOption`]`, "default">[]`                | only on `type="select"`                          |
| defaultValues? | [`Snowflake`]`[]`                                             | only on `type="user"` or `"role"` or `"channel"` |
| defaultValues? | `{ id: `[`Snowflake`]`, type: "user" \| "role" }[]`           | only on `type="mentionable"`                     |
| channelTypes?  | [`ChannelType`]`[]`                                           | only on `type="channel"`                         |
| customId?      | `string`                                                      | experimental                                     |

---

## Content Elements

### text

Children will become text content.

### separator

| prop     | type           | description |
|----------|----------------|-------------|
| divider? | `boolean`      |             |
| spacing? | `"sm" \| "lg"` |             |

### thumbnail

| prop         | type      | description |
|--------------|-----------|-------------|
| description? | `string`  | alt text    |
| spoiler?     | `boolean` |             |
| media?       | `string`  | url         |

### gallery

| prop   | type                        | description   |
|--------|-----------------------------|---------------|
| items? | [`APIMediaGalleryItem`]`[]` | gallery items |

### file

| prop     | type      | description               |
|----------|-----------|---------------------------|
| file?    | `string`  | url as `attachment://...` |
| spoiler? | `boolean` |                           |


[`ButtonInteraction`]: https://discord.js.org/docs/packages/discord.js/14.19.1/ButtonInteraction:Class
[`ColorResolvable`]: https://discord.js.org/docs/packages/discord.js/14.19.1/ColorResolvable:TypeAlias
[`APISelectMenuOption`]: https://discord.js.org/docs/packages/discord.js/14.19.1/APISelectMenuOption:Interface
[`Snowflake`]: https://discord.js.org/docs/packages/discord.js/14.19.1/Snowflake:TypeAlias
[`Snowflake`]: https://discord.js.org/docs/packages/discord.js/14.19.1/Snowflake:TypeAlias
[`AnySelectMenuInteraction`]: https://discord.js.org/docs/packages/discord.js/14.19.1/AnySelectMenuInteraction:TypeAlias
[`ChannelType`]: https://discord.js.org/docs/packages/discord.js/14.19.1/ChannelType:Enum
[`APIMediaGalleryItem`]: https://discord.js.org/docs/packages/discord.js/14.19.1/APIMediaGalleryItem:Interface

