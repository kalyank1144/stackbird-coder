-- =====================================================
-- STACKBIRD-CODER DATABASE SCHEMA - PART 4
-- Indexes for Performance
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_template_type ON public.projects(template_type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_last_opened ON public.projects(last_opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);

-- Project files indexes
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_path ON public.project_files(file_path);
CREATE INDEX IF NOT EXISTS idx_project_files_type ON public.project_files(file_type);
CREATE INDEX IF NOT EXISTS idx_project_files_locked ON public.project_files(is_locked);

-- File versions indexes
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON public.file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_project_id ON public.file_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_created_at ON public.file_versions(created_at DESC);

-- Project snapshots indexes
CREATE INDEX IF NOT EXISTS idx_project_snapshots_project_id ON public.project_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_project_snapshots_created_at ON public.project_snapshots(created_at DESC);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Collaborators indexes
CREATE INDEX IF NOT EXISTS idx_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON public.project_collaborators(user_id);

-- Deployment history indexes
CREATE INDEX IF NOT EXISTS idx_deployment_history_project_id ON public.deployment_history(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_history_status ON public.deployment_history(status);
CREATE INDEX IF NOT EXISTS idx_deployment_history_deployed_at ON public.deployment_history(deployed_at DESC);

-- API usage indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at DESC);
