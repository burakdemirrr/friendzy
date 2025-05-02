/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#EC4899',
        accent: '#14B8A6',
      },
      fontFamily: {
        'sans': ['Sora_400Regular'],
        'sora-light': ['Sora_300Light'],
        'sora-regular': ['Sora_400Regular'],
        'sora-medium': ['Sora_500Medium'],
        'sora-semibold': ['Sora_600SemiBold'],
        'sora-bold': ['Sora_700Bold'],
      },
    },
  },
  plugins: [],
};