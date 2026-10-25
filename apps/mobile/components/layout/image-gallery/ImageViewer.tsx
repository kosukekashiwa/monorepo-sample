import { ArrowLeft } from 'lucide-react-native';
import { FlatList, Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GalleryImage } from './GalleryImage';
import type { GalleryImageSource } from './types';

export type ImageViewerProps = {
  open: boolean;
  /** Called by the back button and the Android back button. */
  onClose: () => void;
  images: GalleryImageSource[];
  /** Index of the image shown first. Defaults to 0. */
  initialIndex?: number;
};

/** Full-screen image viewer on a black background. Swipe horizontally to see the other images. */
export function ImageViewer({ open, onClose, images, initialIndex = 0 }: ImageViewerProps) {
  const { width, height } = useWindowDimensions();

  return (
    <Modal
      visible={open}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <FlatList
          // Remount when reopened so the list starts at the newly selected image.
          key={`${initialIndex}-${width}x${height}`}
          data={images}
          keyExtractor={(_, index) => String(index)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0))}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item, index }) => (
            <View style={[styles.page, { width, height }]}>
              <GalleryImage
                source={item}
                mode="viewer"
                accessibilityLabel={`画像 ${index + 1}/${images.length}`}
              />
            </View>
          )}
        />
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="戻る"
        >
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  page: {
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: rt.insets.top + theme.gap(2),
    left: rt.insets.left + theme.gap(2),
    padding: theme.gap(2),
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  pressed: {
    opacity: 0.6,
  },
}));
