import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Mode Palette
        background: '#10002b',
        foreground: '#e0aaff',
        primary: '#240046',
        secondary: '#3c096c',
        accent: '#5a189a',
        muted: '#7b2cbf',
        destructive: '#9d4edd',
        border: '#c77dff',
        highlight: '#e0aaff',

        // Light Mode Palette
        'background-light': '#dec9e9',
        'foreground-light': '#240046',
        'primary-light': '#dac3e8',
        'secondary-light': '#d2b7e5',
        'accent-light': '#c19ee0',
        'muted-light': '#b185db',
        'destructive-light': '#a06cd5',
        'border-light': '#9163cb',
        'highlight-light': '#815ac0',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    addVariablesForColors,
  ],
};

export default config;
