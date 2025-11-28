-- =====================================================
-- STACKBIRD-CODER DATABASE SCHEMA - PART 3
-- Remaining Tables
-- =====================================================

-- =====================================================
-- 9. COLLABORATION TABLE (for future real-time features)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}'::JSONB,
    invited_by UUID REFERENCES public.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id),
    CONSTRAINT valid_role CHECK (role IN ('owner', 'editor', 'viewer'))
);

-- =====================================================
-- 10. DEPLOYMENT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deployment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    platform TEXT NOT NULL,
    deployment_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    build_log TEXT,
    error_message TEXT,
    deployment_config JSONB DEFAULT '{}'::JSONB,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,
    CONSTRAINT deployment_valid_status CHECK (status IN ('pending', 'building', 'success', 'failed'))
);

-- =====================================================
-- 11. API USAGE TRACKING TABLE (for rate limiting)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- =====================================================
-- 12. MOBILE DEVICE CONFIGS TABLE (for mobile testing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mobile_device_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    device_type TEXT NOT NULL,
    screen_width INTEGER,
    screen_height INTEGER,
    device_model TEXT,
    os_version TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);
