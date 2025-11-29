/**
 * Input Validation Schemas using Zod
 * Prevents SQL injection, XSS, and other security vulnerabilities
 */

import { z } from 'zod';

/**
 * Project Validation Schemas
 */
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  template_type: z.enum(['react', 'vue', 'nextjs', 'expo', 'flutter', 'vanilla', 'angular', 'svelte']),
  framework: z.string().max(50).optional(),
  language: z.enum(['typescript', 'javascript', 'dart', 'python', 'go']),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  is_public: z.boolean().optional(),
  thumbnail_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
});

export const projectUpdateSchema = projectSchema.partial();

/**
 * File Validation Schemas
 */
export const fileSchema = z.object({
  file_path: z
    .string()
    .min(1, 'File path is required')
    .max(500, 'File path must be less than 500 characters')
    .regex(/^[a-zA-Z0-9\s\-_./]+$/, 'Invalid file path'),
  file_name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Invalid file name'),
  content: z.string().max(1000000, 'File content too large (max 1MB)').optional(),
  file_type: z.enum(['file', 'directory']).optional(),
  mime_type: z.string().max(100).optional(),
  size_bytes: z.number().int().min(0).max(10000000).optional(), // Max 10MB
  metadata: z.record(z.any()).optional(),
});

export const filesArraySchema = z.array(fileSchema).max(1000, 'Maximum 1000 files allowed');

/**
 * Snapshot Validation Schemas
 */
export const snapshotSchema = z.object({
  snapshot_name: z
    .string()
    .min(1, 'Snapshot name is required')
    .max(100, 'Snapshot name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Snapshot name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

/**
 * User Validation Schemas
 */
export const userSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  full_name: z.string().max(100, 'Full name must be less than 100 characters').optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

/**
 * Authentication Validation Schemas
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * API Request Validation Schemas
 */
export const projectActionSchema = z.object({
  action: z.enum([
    'create',
    'update',
    'delete',
    'archive',
    'touch',
    'saveFiles',
    'getFiles',
    'createSnapshot',
    'getSnapshots',
    'restoreSnapshot',
    'getStats',
  ]),
  projectId: z.string().uuid('Invalid project ID').optional(),
  projectData: projectSchema.optional(),
  files: filesArraySchema.optional(),
  snapshotName: z.string().max(100).optional(),
  snapshotDescription: z.string().max(500).optional(),
  snapshotId: z.string().uuid('Invalid snapshot ID').optional(),
  createdBy: z.string().uuid('Invalid user ID').optional(),
});

/**
 * Deployment Validation Schemas
 */
export const deploymentSchema = z.object({
  platform: z.enum(['netlify', 'vercel', 'github-pages', 'app-store', 'play-store']),
  deployment_url: z.string().url('Invalid URL').optional(),
  deployment_config: z.record(z.any()).optional(),
});

/**
 * Settings Validation Schemas
 */
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  editor_settings: z
    .object({
      fontSize: z.number().int().min(8).max(32).optional(),
      tabSize: z.number().int().min(2).max(8).optional(),
      lineNumbers: z.boolean().optional(),
      wordWrap: z.boolean().optional(),
      minimap: z.boolean().optional(),
    })
    .optional(),
  ai_preferences: z
    .object({
      model: z.string().max(50).optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().min(100).max(10000).optional(),
    })
    .optional(),
});

/**
 * Helper function to validate and sanitize input
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      };
    }

    return {
      success: false,
      errors: ['Validation failed'],
    };
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize SQL input to prevent SQL injection
 */
export function sanitizeSQL(input: string): string {
  // Remove potentially dangerous SQL characters
  return input.replace(/['";\\]/g, '');
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate file extension
 */
export function isAllowedFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}

/**
 * Allowed file extensions for code files
 */
export const ALLOWED_CODE_EXTENSIONS = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'html',
  'css',
  'scss',
  'sass',
  'less',
  'md',
  'txt',
  'yaml',
  'yml',
  'xml',
  'svg',
  'dart',
  'py',
  'go',
  'rs',
  'vue',
  'svelte',
  'astro',
];
