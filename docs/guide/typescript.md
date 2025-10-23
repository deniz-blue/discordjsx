# TypeScript

`discord-jsx-renderer` is written in TypeScript and comes pre-packaged with types.

However, there are some tweaks you need to do.

## `tsconfig.json`

In your tsconfig file, make sure these two settings are set:

```jsonc [tsconfig.json]
{
  "compilerOptions": {
    // Use modern JSX
    "jsx": "react-jsx",

    // Don't include "DOM" types
    "lib": ["ESNext"],
  },
}
```

## React Element Types

The `@types/react` library exports a bunch of unwanted HTML/`react-dom` related types.

There has been numerous attempts to fix this:
- [DefinitelyTyped#32260](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/32260)
- [DefinitelyTyped#71887](https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/71887)
- [types-react-without-jsx-intrinsics](https://github.com/shirakaba/types-react-without-jsx-intrinsics)
- [blog.pshrmn.com](https://blog.pshrmn.com/trouble-with-react-types/)

We have created another package, `pure-react-types` to fix this issue. It is the same as `@types/react` but just does not have HTML/DOM related types.

You can install it as `@types/react` by specifying it as `@types/react@npm:pure-react-types`:

::: code-group

```sh [npm]
$ npm add --save-dev @types/react@npm:pure-react-types
```

```sh [pnpm]
$ pnpm add --save-dev @types/react@npm:pure-react-types
```

```sh [yarn]
$ yarn add --save-dev @types/react@npm:pure-react-types
```

