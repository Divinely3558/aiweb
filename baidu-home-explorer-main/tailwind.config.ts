import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // 蓝色主色调
          light: "#3b82f6",
          dark: "#1e40af",
        },
      },
    },
  },
  darkMode: false, // 强制浅色主题
} satisfies Config;
