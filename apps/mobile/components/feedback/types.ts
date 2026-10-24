export type FeedbackVariant = 'info' | 'success' | 'warning' | 'error';

export type FeedbackAction = {
  label: string;
  onPress: () => void;
};
