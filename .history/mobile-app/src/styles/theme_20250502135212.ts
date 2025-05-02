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
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-bold',
  h3: 'text-xl font-semibold',
  body: 'text-base',
  caption: 'text-sm text-gray-500'
};

export const layout = {
  card: 'bg-white dark:bg-gray-800 rounded-2xl p-4',
  container: 'px-4 py-6',
  section: 'mb-6'
};

export const components = {
  button: {
    primary: 'bg-primary text-white rounded-full px-6 py-3 font-semibold',
    secondary: 'bg-gray-100 text-gray-900 rounded-full px-6 py-3 font-semibold',
    outline: 'border border-gray-300 text-gray-700 rounded-full px-6 py-3 font-semibold'
  },
  input: 'bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white',
  avatar: {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-12 h-12 rounded-full',
    lg: 'w-16 h-16 rounded-full'
  }
}; 