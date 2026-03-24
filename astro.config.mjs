// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

import alpinejs from '@astrojs/alpinejs';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  adapter: netlify(),

  vite: {
    // @ts-ignore - tailwindcss/vite version mismatch with Astro's bundled Vite
    plugins: [tailwindcss()]
  },

  integrations: [alpinejs(), icon()]
});