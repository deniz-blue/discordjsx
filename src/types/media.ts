import type { APIUnfurledMediaItem, BufferResolvable } from "discord.js";
import type Stream from "node:stream";

/**
 * Either an {@link APIUnfurledMediaItem}, or a URL, or a {@link File}, or a {@link Blob}, or a
 * {@link BufferResolvable} or {@link Stream} with a filename.
 */
export type MediaItemResolvable = APIUnfurledMediaItem | string | File | Blob | {
    name: string;
    attachment: BufferResolvable | Stream | Blob;
};

export type UnfurledMediaResolvable = string;
