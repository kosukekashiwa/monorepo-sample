export const lightTheme = {
  colors: {
    background: '#ffffff',
    text: '#000000',
    link: '#2e78b7',
  },
  gap: (v: number) => v * 4,
} as const;

export const darkTheme = {
  colors: {
    background: '#000000',
    text: '#ffffff',
    link: '#5aa0e0',
  },
  gap: (v: number) => v * 4,
} as const;
