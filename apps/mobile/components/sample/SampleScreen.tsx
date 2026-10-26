import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ChromeScrollView } from '@/components/layout/app-chrome/ChromeScrollView';

type SampleScreenProps = {
  title: string;
  /** Number of placeholder rows, enough to make the screen scroll. Defaults to 30. */
  rows?: number;
};

/** Placeholder content for the sample tabs. */
export function SampleScreen({ title, rows = 30 }: SampleScreenProps) {
  return (
    <ChromeScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.rowText}>
            {title} {index + 1}
          </Text>
        </View>
      ))}
    </ChromeScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(4),
  },
  title: {
    marginTop: theme.gap(4),
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  row: {
    padding: theme.gap(4),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  rowText: {
    fontSize: 14,
    color: theme.colors.text,
  },
}));
