import { MediaItemResolvable } from "../../media.js";

export interface ThumbnailProps {
    media: MediaItemResolvable;
    description?: string;
    spoiler?: boolean;
}
