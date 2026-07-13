/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1D4ED8",        // Deep blue for primary actions/branding
        "primary-light": "#EBF3FF",  // Light blue tint for highlights
        "primary-light-dark": "#1E3A8A", // Dark blue for highlights in dark mode
        "accent": "#F59E0B",         // Orange/gold for ratings/accents
        "background": "#F8FAFC",     // Main app background (slate-50 style)
        "background-dark": "#0F172A", // Dark theme background (slate-900 style)
        "surface": "#FFFFFF",        // Card & modal background
        "surface-dark": "#1E293B",   // Dark theme surface (slate-800 style)
        "text-main": "#0F172A",      // Primary body text (slate-900 style)
        "text-main-dark": "#F8FAFC", // Dark theme primary body text (slate-50 style)
        "text-muted": "#64748B",     // Secondary/sub text (slate-500 style)
        "text-muted-dark": "#94A3B8", // Dark theme secondary/sub text (slate-400 style)
        "text-light": "#94A3B8",     // Placeholder/disabled text (slate-400 style)
        "text-light-dark": "#64748B", // Dark theme placeholder/disabled text
        "border-color": "#E2E8F0",   // Light grey border (slate-200 style)
        "border-color-dark": "#334155", // Dark theme border (slate-700 style)
      },
    },
  },
  plugins: [],
}