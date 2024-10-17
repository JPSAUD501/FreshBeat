import { type Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  plugins: [
    // @ts-expect-error: daisyui does not have type definitions
    daisyui
  ],
  theme: {
    extend: {},
  },
  content: [
    '{routes,islands,components}/**/*.{ts,tsx,js,jsx}',
  ],
} satisfies Config
