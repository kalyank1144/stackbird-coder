import { supabaseClient, supabaseAdmin } from './client';

export interface Project {
  id: string;
  user_id?: string | null;
  name: string;
  description?: string | null;
  template_type: string;
  framework?: string | null;
  language: string;
  status: string;
  is_public: boolean;
  thumbnail_url?: string | null;
  last_opened_at: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  tags: string[];
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  file_name: string;
  content?: string | null;
  content_hash?: string | null;
  file_type?: string | null;
  mime_type?: string | null;
  size_bytes: number;
  is_locked: boolean;
  locked_by?: string | null;
  locked_at?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface ProjectSnapshot {
  id: string;
  project_id: string;
  snapshot_name: string;
  description?: string | null;
  snapshot_data: any;
  file_count: number;
  total_size_bytes: number;
  created_by?: string | null;
  created_at: string;
  metadata?: any;
}

/**
 * Project Service - Handles all project-related database operations
 */
export class ProjectsService {
  /**
   * Create a new project
   */
  static async createProject(projectData: Partial<Project>): Promise<{ data: Project | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert({
          name: projectData.name || 'Untitled Project',
          description: projectData.description,
          template_type: projectData.template_type || 'react',
          framework: projectData.framework,
          language: projectData.language || 'typescript',
          status: 'active',
          is_public: projectData.is_public || false,
          thumbnail_url: projectData.thumbnail_url,
          metadata: projectData.metadata || {},
          tags: projectData.tags || [],
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all projects (optionally filtered by user)
   */
  static async getProjects(userId?: string): Promise<{ data: Project[] | null; error: any }> {
    try {
      let query = supabaseAdmin.from('projects').select('*').eq('status', 'active').order('last_opened_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProject(projectId: string): Promise<{ data: Project | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { data: null, error };
    }
  }

  /**
   * Update a project
   */
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<{ data: Project | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating project:', error);
      return { data: null, error };
    }
  }

  /**
   * Update project last opened timestamp
   */
  static async touchProject(projectId: string): Promise<{ data: Project | null; error: any }> {
    return this.updateProject(projectId, {
      last_opened_at: new Date().toISOString(),
    } as Partial<Project>);
  }

  /**
   * Delete a project (soft delete)
   */
  static async deleteProject(projectId: string): Promise<{ data: Project | null; error: any }> {
    return this.updateProject(projectId, { status: 'deleted' } as Partial<Project>);
  }

  /**
   * Archive a project
   */
  static async archiveProject(projectId: string): Promise<{ data: Project | null; error: any }> {
    return this.updateProject(projectId, { status: 'archived' } as Partial<Project>);
  }

  /**
   * Save project files
   */
  static async saveProjectFiles(projectId: string, files: Partial<ProjectFile>[]): Promise<{ data: any; error: any }> {
    try {
      const filesToInsert = files.map((file) => ({
        project_id: projectId,
        file_path: file.file_path || '',
        file_name: file.file_name || '',
        content: file.content,
        file_type: file.file_type || 'file',
        mime_type: file.mime_type,
        size_bytes: file.size_bytes || 0,
        is_locked: file.is_locked || false,
        metadata: file.metadata || {},
      }));

      const { data, error } = await supabaseAdmin
        .from('project_files')
        .upsert(filesToInsert, {
          onConflict: 'project_id,file_path',
        })
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error saving project files:', error);
      return { data: null, error };
    }
  }

  /**
   * Get project files
   */
  static async getProjectFiles(projectId: string): Promise<{ data: ProjectFile[] | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.from('project_files').select('*').eq('project_id', projectId).order('file_path');

      return { data, error };
    } catch (error) {
      console.error('Error fetching project files:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a project snapshot
   */
  static async createSnapshot(
    projectId: string,
    snapshotName: string,
    description?: string,
    createdBy?: string,
  ): Promise<{ data: ProjectSnapshot | null; error: any }> {
    try {
      // Get all project files
      const { data: files, error: filesError } = await this.getProjectFiles(projectId);

      if (filesError || !files) {
        return { data: null, error: filesError };
      }

      // Create snapshot data
      const snapshotData = {
        files: files.map((f) => ({
          path: f.file_path,
          name: f.file_name,
          content: f.content,
          type: f.file_type,
        })),
      };

      const totalSize = files.reduce((sum, f) => sum + f.size_bytes, 0);

      const { data, error } = await supabaseAdmin
        .from('project_snapshots')
        .insert({
          project_id: projectId,
          snapshot_name: snapshotName,
          description,
          snapshot_data: snapshotData,
          file_count: files.length,
          total_size_bytes: totalSize,
          created_by: createdBy,
          metadata: {},
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating snapshot:', error);
      return { data: null, error };
    }
  }

  /**
   * Get project snapshots
   */
  static async getSnapshots(projectId: string): Promise<{ data: ProjectSnapshot[] | null; error: any }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('project_snapshots')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      return { data: null, error };
    }
  }

  /**
   * Restore project from snapshot
   */
  static async restoreFromSnapshot(snapshotId: string): Promise<{ data: any; error: any }> {
    try {
      // Get snapshot
      const { data: snapshot, error: snapshotError } = await supabaseAdmin
        .from('project_snapshots')
        .select('*')
        .eq('id', snapshotId)
        .single();

      if (snapshotError || !snapshot) {
        return { data: null, error: snapshotError };
      }

      // Delete existing files
      await supabaseAdmin.from('project_files').delete().eq('project_id', snapshot.project_id);

      // Restore files from snapshot
      const files = snapshot.snapshot_data.files.map((f: any) => ({
        project_id: snapshot.project_id,
        file_path: f.path,
        file_name: f.name,
        content: f.content,
        file_type: f.type || 'file',
        size_bytes: f.content?.length || 0,
        is_locked: false,
        metadata: {},
      }));

      const { data, error } = await supabaseAdmin.from('project_files').insert(files).select();

      return { data, error };
    } catch (error) {
      console.error('Error restoring from snapshot:', error);
      return { data: null, error };
    }
  }

  /**
   * Get project statistics
   */
  static async getProjectStats(projectId: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabaseAdmin.from('project_stats').select('*').eq('project_id', projectId).single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      return { data: null, error };
    }
  }
}
