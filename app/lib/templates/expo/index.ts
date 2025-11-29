import type { BundledTemplate } from '~/lib/templates/types';

export const expoTemplate: BundledTemplate = {
  name: 'Expo App',
  files: [
    {
      name: 'package.json',
      path: 'package.json',
      content: `{
  "name": "expo-app",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.28",
    "expo-router": "~3.5.23",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "3.31.1",
    "nativewind": "^2.0.11",
    "framer-motion": "^12.23.24"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.2.79",
    "tailwindcss": "^3.4.14",
    "typescript": "~5.3.3"
  },
  "private": true
}`,
    },
    {
      name: 'app.json',
      path: 'app.json',
      content: `{
  "expo": {
    "name": "expo-app",
    "slug": "expo-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "scheme": "expo-app"
  }
}`,
    },
    {
      name: 'tsconfig.json',
      path: 'tsconfig.json',
      content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}`,
    },
    {
      name: 'tailwind.config.js',
      path: 'tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    },
    {
      name: 'babel.config.js',
      path: 'babel.config.js',
      content: `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ["nativewind/babel"],
  };
};`,
    },
    {
      name: '_layout.tsx',
      path: 'app/_layout.tsx',
      content: `import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
    </Stack>
  );
}`,
    },
    {
      name: 'index.tsx',
      path: 'app/index.tsx',
      content: `import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Welcome to Expo!
      </Text>
      <Text className="text-gray-600 mb-6">
        Edit app/index.tsx to get started
      </Text>
      <Pressable
        onPress={() => setCount(count + 1)}
        className="bg-blue-500 px-6 py-3 rounded-lg active:bg-blue-600"
      >
        <Text className="text-white font-semibold">
          Count: {count}
        </Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}`,
    },
    {
      name: '.gitignore',
      path: '.gitignore',
      content: `# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo`,
    },
  ],
};
