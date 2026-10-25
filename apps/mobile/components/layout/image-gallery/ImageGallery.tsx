import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GalleryImage } from './GalleryImage';
import { ImageViewer } from './ImageViewer';
import { MAX_GALLERY_IMAGES, type GalleryImageSource } from './types';

export type ImageGalleryProps = {
  /** Up to 4 images. Extra images are ignored. */
  images: GalleryImageSource[];
};

type Orientation = 'portrait' | 'square' | 'landscape';

function getOrientation(width: number, height: number): Orientation {
  const ratio = width / height;
  // Allow a small tolerance so e.g. 1000x1001 still counts as square.
  if (Math.abs(ratio - 1) < 0.01) {
    return 'square';
  }
  return ratio < 1 ? 'portrait' : 'landscape';
}

function getInitialOrientation(source: GalleryImageSource | undefined): Orientation {
  if (source === undefined) {
    return 'landscape';
  }
  if (typeof source === 'number') {
    const asset = Image.resolveAssetSource(source);
    if (asset?.width && asset.height) {
      return getOrientation(asset.width, asset.height);
    }
  } else if (source.width && source.height) {
    return getOrientation(source.width, source.height);
  }
  // Unknown until the image loads.
  return 'landscape';
}

/**
 * Shows up to 4 images as a preview grid. Pressing an image opens it in a full-screen viewer.
 *
 * - 1 image: 3:4 (portrait), 1:1 (square) or 16:9 (landscape)
 * - 2 images: 8:9 | 8:9
 * - 3 images: 8:9 | 16:9 over 16:9
 * - 4 images: 16:9 in a 2x2 grid
 */
export function ImageGallery({ images }: ImageGalleryProps) {
  if (__DEV__ && images.length > MAX_GALLERY_IMAGES) {
    console.warn(`ImageGallery: up to ${MAX_GALLERY_IMAGES} images are supported; the rest are ignored.`);
  }

  const shown = images.slice(0, MAX_GALLERY_IMAGES);
  const [orientation, setOrientation] = useState<Orientation>(() => getInitialOrientation(shown[0]));
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  styles.useVariants({ orientation });

  if (shown.length === 0) {
    return null;
  }

  const renderTile = (index: number) => {
    const source = shown[index];
    if (source === undefined) {
      return null;
    }
    return (
      <Pressable
        key={index}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        onPress={() => setViewerIndex(index)}
        accessibilityRole="button"
        accessibilityHint="画像を拡大表示します"
      >
        <GalleryImage
          source={source}
          mode="preview"
          accessibilityLabel={`画像 ${index + 1}/${shown.length}`}
          onLoad={
            shown.length === 1
              ? ({ width, height }) => setOrientation(getOrientation(width, height))
              : undefined
          }
        />
      </Pressable>
    );
  };

  let content;
  switch (shown.length) {
    case 1:
      content = <View style={styles.single}>{renderTile(0)}</View>;
      break;
    case 2:
      content = (
        <View style={styles.grid}>
          <View style={styles.column}>{renderTile(0)}</View>
          <View style={styles.column}>{renderTile(1)}</View>
        </View>
      );
      break;
    case 3:
      content = (
        <View style={styles.grid}>
          <View style={styles.column}>{renderTile(0)}</View>
          <View style={styles.column}>
            {renderTile(1)}
            {renderTile(2)}
          </View>
        </View>
      );
      break;
    default:
      content = (
        <View style={styles.grid}>
          <View style={styles.column}>
            {renderTile(0)}
            {renderTile(2)}
          </View>
          <View style={styles.column}>
            {renderTile(1)}
            {renderTile(3)}
          </View>
        </View>
      );
  }

  return (
    <>
      {content}
      <ImageViewer
        open={viewerIndex !== null}
        onClose={() => setViewerIndex(null)}
        images={shown}
        initialIndex={viewerIndex ?? 0}
      />
    </>
  );
}

const GAP = 2;

const styles = StyleSheet.create((theme) => ({
  single: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
    variants: {
      orientation: {
        portrait: { aspectRatio: 3 / 4 },
        square: { aspectRatio: 1 },
        landscape: { aspectRatio: 16 / 9 },
      },
    },
  },
  // 2-4 images fill a 16:9 frame, which makes each tile 8:9 (half width, full height)
  // or 16:9 (half width, half height).
  grid: {
    flexDirection: 'row',
    gap: GAP,
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  column: {
    flex: 1,
    gap: GAP,
  },
  tile: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
}));
