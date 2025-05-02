export const colors = {
  // Base colors
  primary: '#6366F1', // Indigo
  secondary: '#EC4899', // Pink
  accent: '#14B8A6', // Teal

  // Background colors
  background: {
    primary: '#F8FAFC', // Light mode
    secondary: '#F1F5F9',
    dark: '#0F172A', // Dark mode
    darker: '#1E293B'
  },

  // Text colors
  text: {
    primary: '#1E293B', // Light mode
    secondary: '#64748B',
    white: '#FFFFFF',
    muted: '#94A3B8'
  },

  // Border colors
  border: {
    light: '#E2E8F0',
    dark: '#334155'
  },

  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6'
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8
  }
};

export const typography = {
  h1: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text.primary
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary
  },
  body: {
    fontSize: 16,
    color: colors.text.primary
  },
  caption: {
    fontSize: 14,
    color: colors.text.secondary
  }
};

export const layout = {
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    ...shadows.md
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24
  },
  section: {
    marginBottom: 24
  }
};

export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center'
    },
    secondary: {
      backgroundColor: colors.background.secondary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center'
    },
    outline: {
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text.primary
  },
  avatar: {
    sm: {
      width: 32,
      height: 32,
      borderRadius: 16
    },
    md: {
      width: 48,
      height: 48,
      borderRadius: 24
    },
    lg: {
      width: 64,
      height: 64,
      borderRadius: 32
    }
  }
}; 