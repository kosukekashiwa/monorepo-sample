import type { ImageRequireSource, ImageURISource } from 'react-native';

/** A remote image (`{ uri }`) or a local image (`require('./image.png')`). */
export type GalleryImageSource = ImageURISource | ImageRequireSource;

export const MAX_GALLERY_IMAGES = 4;
