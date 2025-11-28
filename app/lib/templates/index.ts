/**
 * Bundled Templates - These templates are stored locally for instant loading
 * No network request needed for these templates
 */

import { viteReactTemplate } from './vite-react';
import { vanillaViteTemplate } from './vanilla-vite';
import { nextjsShadcnTemplate } from './nextjs-shadcn';
import { vueTemplate } from './vue';
import { expoTemplate } from './expo';
import { flutterTemplate } from './flutter';

// Re-export types from types.ts
export type { TemplateFile, BundledTemplate } from './types';
import type { BundledTemplate, TemplateFile } from './types';

// Map of template names to their bundled files
export const BUNDLED_TEMPLATES: Record<string, BundledTemplate> = {
  'Vite React': viteReactTemplate,
  'Vanilla Vite': vanillaViteTemplate,
  'NextJS Shadcn': nextjsShadcnTemplate,
  Vue: vueTemplate,
  'Expo App': expoTemplate,
  'Flutter App': flutterTemplate,
};

// List of template names that are bundled locally
export const BUNDLED_TEMPLATE_NAMES = Object.keys(BUNDLED_TEMPLATES);

/**
 * Check if a template is bundled locally
 */
export function isTemplateBundled(templateName: string): boolean {
  return templateName in BUNDLED_TEMPLATES;
}

/**
 * Get bundled template files
 * Returns null if template is not bundled
 */
export function getBundledTemplate(templateName: string): TemplateFile[] | null {
  const template = BUNDLED_TEMPLATES[templateName];
  return template ? template.files : null;
}
