import { useState } from 'react';
import { Image, Text, View, type ImageLoadEvent } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { GalleryImageSource } from './types';

export const FALLBACK_MESSAGE = '読み込めませんでした。';

type GalleryImageProps = {
  source: GalleryImageSource;
  /** 'preview' fills its frame (cover); 'viewer' fits the whole image on a black background (contain). */
  mode: 'preview' | 'viewer';
  accessibilityLabel?: string;
  /** Called with the intrinsic size of the image once it has loaded. */
  onLoad?: (size: { width: number; height: number }) => void;
};

/** An image that fills its parent and shows a fallback message when it fails to load. */
export function GalleryImage({ source, mode, accessibilityLabel, onLoad }: GalleryImageProps) {
  const [failed, setFailed] = useState(false);

  styles.useVariants({ mode });

  const handleLoad = (event: ImageLoadEvent) => {
    if (!onLoad) {
      return;
    }
    // On web the load event carries no size, so ask for it separately.
    const size = event.nativeEvent?.source;
    if (size?.width && size.height) {
      onLoad({ width: size.width, height: size.height });
    } else if (typeof source !== 'number' && source.uri) {
      Image.getSize(
        source.uri,
        (width, height) => onLoad({ width, height }),
        () => {},
      );
    }
  };

  if (failed) {
    return (
      <View style={styles.fallback} accessibilityLabel={accessibilityLabel}>
        <Text style={styles.fallbackText}>{FALLBACK_MESSAGE}</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={styles.image}
      resizeMode={mode === 'preview' ? 'cover' : 'contain'}
      accessibilityLabel={accessibilityLabel}
      onLoad={handleLoad}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.gap(2),
    variants: {
      mode: {
        preview: { backgroundColor: theme.colors.border },
        viewer: { backgroundColor: '#000000' },
      },
    },
  },
  fallbackText: {
    fontSize: 14,
    textAlign: 'center',
    variants: {
      mode: {
        preview: { color: theme.colors.textMuted },
        viewer: { color: '#ffffff' },
      },
    },
  },
}));
