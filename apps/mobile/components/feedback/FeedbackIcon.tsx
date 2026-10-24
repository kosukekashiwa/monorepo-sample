import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { useUnistyles } from 'react-native-unistyles';

import type { FeedbackVariant } from './types';

const icons: Record<FeedbackVariant, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
};

type FeedbackIconProps = {
  variant: FeedbackVariant;
  size?: number;
};

export function FeedbackIcon({ variant, size = 20 }: FeedbackIconProps) {
  const { theme } = useUnistyles();
  const Icon = icons[variant];

  return <Icon size={size} color={theme.colors.feedback[variant].accent} />;
}
