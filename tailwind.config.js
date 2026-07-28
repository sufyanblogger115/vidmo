/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#07070b',
        surface: '#0f0f18',
        edge: 'rgba(255,255,255,0.08)',
        violet: { DEFAULT: '#8b5cf6', dim: '#6d28d9' },
        azure: { DEFAULT: '#3b82f6', dim: '#1d4ed8' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'aurora': 'radial-gradient(60% 60% at 20% 0%, rgba(139,92,246,0.25) 0%, rgba(0,0,0,0) 60%), radial-gradient(50% 50% at 90% 20%, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 60%)',
        'grad-primary': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(139,92,246,0.55)',
        panel: '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
    },
  },
  plugins: [],
};
