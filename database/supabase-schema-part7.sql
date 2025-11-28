-- =====================================================
-- STACKBIRD-CODER DATABASE SCHEMA - PART 7
-- Seed Data
-- =====================================================

-- Insert default project templates
INSERT INTO public.project_templates (name, description, template_type, framework, language, is_public, template_data, tags)
VALUES 
    ('Flutter App', 'Flutter mobile app with Supabase backend', 'official', 'flutter', 'dart', TRUE, 
     '{"files": [], "dependencies": {"flutter": "latest", "supabase_flutter": "latest"}}'::JSONB,
     ARRAY['flutter', 'mobile', 'dart', 'supabase']),
    ('React App', 'React web app with Vite', 'official', 'vite', 'typescript', TRUE,
     '{"files": [], "dependencies": {"react": "^18.3.1", "vite": "latest"}}'::JSONB,
     ARRAY['react', 'web', 'typescript', 'vite']),
    ('Next.js App', 'Next.js with ShadCN UI', 'official', 'nextjs', 'typescript', TRUE,
     '{"files": [], "dependencies": {"next": "latest", "react": "latest"}}'::JSONB,
     ARRAY['nextjs', 'web', 'typescript', 'shadcn']),
    ('Expo App', 'React Native app with Expo', 'official', 'expo', 'typescript', TRUE,
     '{"files": [], "dependencies": {"expo": "~51.0.28", "react-native": "latest"}}'::JSONB,
     ARRAY['expo', 'mobile', 'react-native', 'typescript'])
ON CONFLICT DO NOTHING;

-- Insert default mobile device configurations
INSERT INTO public.mobile_device_configs (device_name, platform, device_type, screen_width, screen_height, device_model, os_version, metadata)
VALUES
    ('iPhone 15 Pro', 'ios', 'simulator', 393, 852, 'iPhone 15 Pro', '17.0', '{"notch": true, "dynamic_island": true}'::JSONB),
    ('iPhone 15 Pro Max', 'ios', 'simulator', 430, 932, 'iPhone 15 Pro Max', '17.0', '{"notch": true, "dynamic_island": true}'::JSONB),
    ('iPhone SE', 'ios', 'simulator', 375, 667, 'iPhone SE (3rd generation)', '17.0', '{"notch": false}'::JSONB),
    ('iPad Pro 12.9"', 'ios', 'simulator', 1024, 1366, 'iPad Pro (12.9-inch)', '17.0', '{"tablet": true}'::JSONB),
    ('Pixel 8 Pro', 'android', 'emulator', 412, 915, 'Pixel 8 Pro', '14.0', '{"notch": false}'::JSONB),
    ('Pixel 8', 'android', 'emulator', 412, 915, 'Pixel 8', '14.0', '{"notch": false}'::JSONB),
    ('Samsung Galaxy S24', 'android', 'emulator', 360, 800, 'Galaxy S24', '14.0', '{"notch": true}'::JSONB),
    ('Nexus 7 Tablet', 'android', 'emulator', 600, 960, 'Nexus 7', '13.0', '{"tablet": true}'::JSONB)
ON CONFLICT DO NOTHING;
