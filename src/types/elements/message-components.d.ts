import { ButtonProps } from "../props/interactible/button.js";
import { LabelProps } from "../props/layout/label.js";
import { OptionProps, SelectProps } from "../props/interactible/select.js";
import { TextInputProps } from "../props/interactible/text-input.js";
import { ContainerProps } from "../props/layout/container.js";
import { ThumbnailProps } from "../props/content/thumbnail.js";
import { GalleryItemProps } from "../props/content/gallery-item.js";
import { FileProps } from "../props/content/file.js";
import { SeparatorProps } from "../props/content/separator.js";

export interface IntrinsicMessageComponents {
    // layout
    container: ContainerProps & React.JSX.IntrinsicAttributes;
    row: PropsWithChildren & React.JSX.IntrinsicAttributes;
    section: PropsWithChildren & React.JSX.IntrinsicAttributes;
    accessory: PropsWithChildren & React.JSX.IntrinsicAttributes;
    label: LabelProps & React.JSX.IntrinsicAttributes;

    // interactive
    button: ButtonProps & React.JSX.IntrinsicAttributes;
    select: SelectProps & React.JSX.IntrinsicAttributes;
    option: OptionProps & React.JSX.IntrinsicAttributes;
    'text-input': TextInputProps & React.JSX.IntrinsicAttributes;

    // content
    text: PropsWithChildren & React.JSX.IntrinsicAttributes;
    thumbnail: ThumbnailProps & React.JSX.IntrinsicAttributes;
    gallery: PropsWithChildren & React.JSX.IntrinsicAttributes;
    'gallery-item': GalleryItemProps & React.JSX.IntrinsicAttributes;
    file: FileProps & React.JSX.IntrinsicAttributes;
    separator: SeparatorProps & React.JSX.IntrinsicAttributes;
}
