import { type Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  plugins: [
    // @ts-expect-error: DaisyUI does not have type definitions
    daisyui,
  ],
  theme: {},
  content: [
    '{routes,islands,components}/**/*.{ts,tsx,js,jsx}',
  ],
  daisyui: {
    themes: [],
  },
} satisfies Config
