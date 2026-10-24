export const lightTheme = {
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    textMuted: '#5f6368',
    border: '#e0e0e0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    link: '#2e78b7',
    feedback: {
      info: { background: '#e8f1fb', foreground: '#0b3d6e', accent: '#2e78b7' },
      success: { background: '#e7f6ec', foreground: '#0f4d26', accent: '#1e8e3e' },
      warning: { background: '#fef4e5', foreground: '#5c3b00', accent: '#e37400' },
      error: { background: '#fdecea', foreground: '#6b1414', accent: '#d93025' },
    },
  },
  gap: (v: number) => v * 4,
} as const;

export const darkTheme = {
  colors: {
    background: '#000000',
    surface: '#1e1e1e',
    text: '#ffffff',
    textMuted: '#9aa0a6',
    border: '#3c4043',
    overlay: 'rgba(0, 0, 0, 0.7)',
    link: '#5aa0e0',
    feedback: {
      info: { background: '#10253b', foreground: '#d2e6fb', accent: '#5aa0e0' },
      success: { background: '#0f2a19', foreground: '#ccefd8', accent: '#5bb974' },
      warning: { background: '#33240a', foreground: '#fde5c0', accent: '#fbbc04' },
      error: { background: '#3a1414', foreground: '#f9d6d3', accent: '#f28b82' },
    },
  },
  gap: (v: number) => v * 4,
} as const;
