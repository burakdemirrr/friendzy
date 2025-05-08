export const colors = {
  // Base colors
  primary: '#007AFF', // iOS Blue
  secondary: '#FF2D55', // iOS Pink
  accent: '#5856D6', // iOS Purple

  // Background colors
  background: {
    primary: '#FFFFFF', // Pure white for light mode
    secondary: '#F2F2F7', // iOS system gray 6
    dark: '#000000', // Pure black for dark mode
    darker: '#1C1C1E', // iOS system gray 6 dark
    elevated: '#FFFFFF' // For cards and elevated surfaces
  },

  // Text colors
  text: {
    primary: '#000000', // Light mode
    secondary: '#6C6C70', // iOS system gray
    white: '#FFFFFF',
    muted: '#8E8E93' // iOS system gray 2
  },

  // Border colors
  border: {
    light: '#E5E5EA', // iOS system gray 5
    dark: '#38383A' // iOS system gray 5 dark
  },

  // Status colors
  success: '#34C759', // iOS green
  error: '#FF3B30', // iOS red
  warning: '#FF9500', // iOS orange
  info: '#007AFF' // iOS blue
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8
  }
};

export const typography = {
  h1: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
    color: colors.text.primary
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.35,
    color: colors.text.primary
  },
  h3: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.33,
    color: colors.text.primary
  },
  body: {
    fontSize: 17,
    letterSpacing: -0.41,
    color: colors.text.primary
  },
  caption: {
    fontSize: 15,
    letterSpacing: -0.24,
    color: colors.text.secondary
  }
};

export const layout = {
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: 16,
    padding: 16,
    ...shadows.md,
    marginHorizontal: 16,
    marginVertical: 8
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: colors.background.primary
  },
  section: {
    marginBottom: 32
  }
};

export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48
    },
    secondary: {
      backgroundColor: colors.background.secondary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48
    },
    outline: {
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48
    }
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text.primary,
    fontSize: 17,
    minHeight: 48
  },
  avatar: {
    sm: {
      width: 36,
      height: 36,
      borderRadius: 18
    },
    md: {
      width: 52,
      height: 52,
      borderRadius: 26
    },
    lg: {
      width: 72,
      height: 72,
      borderRadius: 36
    }
  }
}; 