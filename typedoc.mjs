import { version } from "discord.js";

const djs = (name) => `https://discord.js.org/docs/packages/discord.js/${version}/${name}`;

/** @type {Partial<import("typedoc").TypeDocOptions>} */
export default {
  // plugin: ["typedoc-plugin-markdown"],
  entryPoints: ["./src/types/index.ts"],
  readme: "none",
  categorizeByGroup: true,
  externalSymbolLinkMappings: {
    "discord.js": {
      BufferResolvable: djs("BufferResolvable:TypeAlias"),
    },
    "discord-api-types": {
      APIUnfurledMediaItem: "https://discord.js.org/docs/packages/discord-api-types/main/APIUnfurledMediaItem:Interface",
    },
    "@types/node": {
      Stream: "https://nodejs.org/api/stream.html",
      "__global.Blob": "https://developer.mozilla.org/en-US/docs/Web/API/Blob",
      "__global.File": "https://developer.mozilla.org/en-US/docs/Web/API/File",
    },
  },
  // out: "./docs/__typedoc",
  outputs: [
    { name: "json", path: "./scripts/docs.generated.json" },
  ],
}
