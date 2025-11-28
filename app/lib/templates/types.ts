/**
 * Template types - separated to avoid circular dependencies
 */

export interface TemplateFile {
  name: string;
  path: string;
  content: string;
}

export interface BundledTemplate {
  name: string;
  files: TemplateFile[];
}
