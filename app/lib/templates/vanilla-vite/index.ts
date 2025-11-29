import type { BundledTemplate } from '~/lib/templates/types';

export const vanillaViteTemplate: BundledTemplate = {
  name: 'Vanilla Vite',
  files: [
    {
      name: 'package.json',
      path: 'package.json',
      content: `{
  "name": "vanilla-vite-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "framer-motion": "^12.23.24",
    "react-icons": "^5.3.0"
  },
  "devDependencies": {
    "vite": "^5.4.10"
  }
}`,
    },
    {
      name: 'vite.config.js',
      path: 'vite.config.js',
      content: `import { defineConfig } from 'vite'

export default defineConfig({
  // Add your Vite configuration here
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
    <title>Vanilla + Vite</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
    },
    {
      name: 'main.js',
      path: 'src/main.js',
      content: `import './style.css'

document.querySelector('#app').innerHTML = \`
  <div class="container">
    <h1>Hello Vite!</h1>
    <p>Edit <code>src/main.js</code> to get started</p>
    <button id="counter" type="button">Count: 0</button>
  </div>
\`

let count = 0
const button = document.querySelector('#counter')
button.addEventListener('click', () => {
  count++
  button.textContent = \`Count: \${count}\`
})`,
    },
    {
      name: 'style.css',
      path: 'src/style.css',
      content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  button {
    background-color: #f9f9f9;
  }
}`,
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
