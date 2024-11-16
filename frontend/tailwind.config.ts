import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

// Aceternity plugin for adding CSS variables for colors
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
        // Custom color palette based on your design
        background: '#020817',
        foreground: '#f0f0f0',
        card: {
          DEFAULT: '#050b1b',
          foreground: '#f0f0f0',
        },
        popover: {
          DEFAULT: '#040a19',
          foreground: '#f0f0f0',
        },
        primary: {
          DEFAULT: '#050b1b',
          foreground: '#f0f0f0',
        },
        secondary: {
          DEFAULT: '#030918',
          foreground: '#f0f0f0',
        },
        muted: {
          DEFAULT: '#070d1d',
          foreground: '#f0f0f0',
        },
        accent: {
          DEFAULT: '#18CCFC',
          foreground: '#f0f0f0',
        },
        destructive: {
          DEFAULT: '#AE48FF',
          foreground: '#f0f0f0',
        },
        border: '#060c1c',
        input: '#060c1c',
        ring: '#18CCFC',
        chart: {
          '1': '#18CCFC',
          '2': '#6344F5',
          '3': '#AE48FF',
          '4': '#18CCFC',
          '5': '#6344F5',
        },
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
    addVariablesForColors, // Include the Aceternity plugin for dynamic variables
  ],
};

export default config;
