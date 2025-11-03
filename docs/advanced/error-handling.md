# Error Handling

`discord-jsx-renderer` can handle 2 types of errors:

- **React rendering error** - errors that happen while trying to render a React component
- **Message updating error** - errors that happen while trying to update the target message with new data

These errors will be automatically reported in the **target message**. This is useful because you will be able to see the error most likely *as it happens* in Discord. This is called **error reporting**.

Stack traces in error reports are shortened to make it more readable. You can check the console for the stack trace with file paths.

React rendering errors will also include the relevant component stack.

There is also a third type of error, **error reporting error**, which means there was an error while `discord-jsx-renderer` was trying to display a previous error.

All three types of errors will be logged in the console.

## Customizing Error Messages

To customize the default error message, you need to provide your own function that returns a message payload.

```ts
import { djsx } from "discord-jsx-renderer";

djsx.createErrorPayload = (err: Error, info?: React.ErrorInfo) => {
    // ...
}
```

## Dont report errors

`return false` inside `createErrorPayload`
