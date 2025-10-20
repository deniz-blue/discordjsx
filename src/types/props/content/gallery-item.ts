import { MediaItemResolvable } from "../../media.js";

export interface GalleryItemProps {
    media: MediaItemResolvable;
    description?: string | null;
    spoiler?: boolean;
}
