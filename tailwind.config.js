/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-black": "#0a0a0a",
        "brand-green": "#14f195",
        "brand-purple": "#9945ff",
      },
    },
  },
  plugins: [],
};
