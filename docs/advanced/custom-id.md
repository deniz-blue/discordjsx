# Custom IDs

By default, when a component does not have a `customId` prop, **djsx** automatically generates a random `custom_id` value.

**djsx** will also wrap this value by default with the **instance id** to be able to find the incoming interaction's react instance. (it keeps a cache of the final custom ids and does not actually use the instance id inside the custom id string)

You can customize this behavior by overriding the `djsx.createCustomId` function.

```ts
import { djsx } from "discord-jsx-renderer";

djsx.createCustomId = (instanceId: string, providedId?: string) => {
    // Example: make all components required to specify customId
    if(!providedId) throw new Error("customId not provided")
    return providedId
}
```
