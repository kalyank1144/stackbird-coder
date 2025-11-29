import type { BundledTemplate } from '~/lib/templates/types';

export const vueTemplate: BundledTemplate = {
  name: 'Vue',
  files: [
    {
      name: 'package.json',
      path: 'package.json',
      content: `{
  "name": "vue-app",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.12",
    "framer-motion": "^12.23.24"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  }
}`,
    },
    {
      name: 'vite.config.js',
      path: 'vite.config.js',
      content: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`,
    },
    {
      name: 'index.html',
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue + Vite</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
    },
    {
      name: 'tailwind.config.js',
      path: 'tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    },
    {
      name: 'postcss.config.js',
      path: 'postcss.config.js',
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    },
    {
      name: 'main.js',
      path: 'src/main.js',
      content: `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')`,
    },
    {
      name: 'App.vue',
      path: 'src/App.vue',
      content: `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">
        Welcome to Vue + Vite
      </h1>
      <p class="text-gray-600 mb-6">
        Edit <code class="bg-gray-200 px-2 py-1 rounded">src/App.vue</code> to get started
      </p>
      <button 
        @click="count++"
        class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Count is: {{ count }}
      </button>
    </div>
  </div>
</template>`,
    },
    {
      name: 'style.css',
      path: 'src/style.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    {
      name: '.gitignore',
      path: '.gitignore',
      content: `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`,
    },
  ],
};
