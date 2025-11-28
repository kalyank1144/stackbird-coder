-- =====================================================
-- STACKBIRD-CODER DATABASE SCHEMA - PART 6
-- Views and Helper Functions
-- =====================================================

-- View for project statistics
CREATE OR REPLACE VIEW public.project_stats AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.user_id,
    COUNT(DISTINCT pf.id) AS file_count,
    SUM(pf.size_bytes) AS total_size_bytes,
    COUNT(DISTINCT ps.id) AS snapshot_count,
    COUNT(DISTINCT dh.id) AS deployment_count,
    MAX(p.last_opened_at) AS last_opened_at,
    p.created_at,
    p.updated_at
FROM public.projects p
LEFT JOIN public.project_files pf ON p.id = pf.project_id
LEFT JOIN public.project_snapshots ps ON p.id = ps.project_id
LEFT JOIN public.deployment_history dh ON p.id = dh.project_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.user_id, p.created_at, p.updated_at;

-- View for recent activity
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT 
    al.id,
    al.user_id,
    al.project_id,
    al.action_type,
    al.entity_type,
    al.description,
    al.created_at,
    p.name AS project_name,
    u.full_name AS user_name
FROM public.activity_logs al
LEFT JOIN public.projects p ON al.project_id = p.id
LEFT JOIN public.users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 100;

-- Function to create a new project with initial file structure
CREATE OR REPLACE FUNCTION create_project_with_files(
    p_user_id UUID,
    p_name TEXT,
    p_template_type TEXT,
    p_framework TEXT,
    p_language TEXT,
    p_files JSONB
)
RETURNS UUID AS $$
DECLARE
    v_project_id UUID;
    v_file JSONB;
BEGIN
    INSERT INTO public.projects (user_id, name, template_type, framework, language)
    VALUES (p_user_id, p_name, p_template_type, p_framework, p_language)
    RETURNING id INTO v_project_id;
    
    FOR v_file IN SELECT * FROM jsonb_array_elements(p_files)
    LOOP
        INSERT INTO public.project_files (
            project_id, 
            file_path, 
            file_name, 
            content, 
            file_type,
            content_hash
        )
        VALUES (
            v_project_id,
            v_file->>'path',
            v_file->>'name',
            v_file->>'content',
            COALESCE(v_file->>'type', 'file'),
            encode(digest(COALESCE(v_file->>'content', ''), 'sha256'), 'hex')
        );
    END LOOP;
    
    INSERT INTO public.activity_logs (user_id, project_id, action_type, entity_type, description)
    VALUES (p_user_id, v_project_id, 'create', 'project', 'Created new project: ' || p_name);
    
    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create project snapshot
CREATE OR REPLACE FUNCTION create_project_snapshot(
    p_project_id UUID,
    p_snapshot_name TEXT,
    p_description TEXT,
    p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_snapshot_id UUID;
    v_snapshot_data JSONB;
    v_file_count INTEGER;
    v_total_size BIGINT;
BEGIN
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'path', file_path,
                'name', file_name,
                'content', content,
                'type', file_type
            )
        ),
        COUNT(*),
        SUM(size_bytes)
    INTO v_snapshot_data, v_file_count, v_total_size
    FROM public.project_files
    WHERE project_id = p_project_id;
    
    INSERT INTO public.project_snapshots (
        project_id, 
        snapshot_name, 
        description, 
        snapshot_data,
        file_count,
        total_size_bytes,
        created_by
    )
    VALUES (
        p_project_id,
        p_snapshot_name,
        p_description,
        v_snapshot_data,
        v_file_count,
        v_total_size,
        p_created_by
    )
    RETURNING id INTO v_snapshot_id;
    
    RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
