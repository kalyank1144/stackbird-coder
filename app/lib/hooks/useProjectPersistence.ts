import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ProjectFile {
  path: string;
  name: string;
  content: string;
  type?: string;
}

interface ProjectData {
  id?: string;
  name: string;
  description?: string;
  template_type: string;
  framework?: string;
  language: string;
  files: ProjectFile[];
  metadata?: any;
  tags?: string[];
}

interface UseProjectPersistenceOptions {
  projectId?: string;
  autoSaveInterval?: number; // milliseconds
  enabled?: boolean;
}

export function useProjectPersistence(
  projectData: ProjectData,
  options: UseProjectPersistenceOptions = {},
) {
  const { projectId, autoSaveInterval = 30000, enabled = true } = options;
  
  const lastSavedRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  /**
   * Save project to Supabase
   */
  const saveProject = useCallback(async (showToast = true) => {
    if (!enabled || isSavingRef.current) {
      return { success: false, message: 'Save already in progress' };
    }

    try {
      isSavingRef.current = true;
      
      const currentData = JSON.stringify(projectData);
      
      // Skip if no changes
      if (currentData === lastSavedRef.current) {
        return { success: true, message: 'No changes to save' };
      }

      // Determine if creating new project or updating existing
      const action = projectId ? 'update' : 'create';
      const endpoint = '/api/projects';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          projectId,
          projectData: {
            name: projectData.name,
            description: projectData.description,
            template_type: projectData.template_type,
            framework: projectData.framework,
            language: projectData.language,
            metadata: projectData.metadata,
            tags: projectData.tags,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const result = await response.json();
      const savedProjectId = result.project?.id || projectId;

      // Save files
      if (projectData.files && projectData.files.length > 0) {
        const filesResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'saveFiles',
            projectId: savedProjectId,
            files: projectData.files.map((file) => ({
              file_path: file.path,
              file_name: file.name,
              content: file.content,
              file_type: file.type || 'file',
              size_bytes: file.content?.length || 0,
            })),
          }),
        });

        if (!filesResponse.ok) {
          throw new Error('Failed to save project files');
        }
      }

      lastSavedRef.current = currentData;

      if (showToast) {
        toast.success('Project saved successfully', {
          position: 'bottom-right',
          autoClose: 2000,
        });
      }

      return {
        success: true,
        message: 'Project saved successfully',
        projectId: savedProjectId,
      };
    } catch (error: any) {
      console.error('Error saving project:', error);
      
      if (showToast) {
        toast.error(`Failed to save project: ${error.message}`, {
          position: 'bottom-right',
          autoClose: 5000,
        });
      }

      return {
        success: false,
        message: error.message || 'Failed to save project',
      };
    } finally {
      isSavingRef.current = false;
    }
  }, [projectData, projectId, enabled]);

  /**
   * Load project from Supabase
   */
  const loadProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`);

      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const result = await response.json();
      const project = result.project;

      // Load project files
      const filesResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getFiles',
          projectId: id,
        }),
      });

      if (!filesResponse.ok) {
        throw new Error('Failed to load project files');
      }

      const filesResult = await filesResponse.json();
      const files = filesResult.files || [];

      return {
        success: true,
        project: {
          ...project,
          files: files.map((f: any) => ({
            path: f.file_path,
            name: f.file_name,
            content: f.content,
            type: f.file_type,
          })),
        },
      };
    } catch (error: any) {
      console.error('Error loading project:', error);
      
      toast.error(`Failed to load project: ${error.message}`, {
        position: 'bottom-right',
        autoClose: 5000,
      });

      return {
        success: false,
        message: error.message || 'Failed to load project',
      };
    }
  }, []);

  /**
   * Create project snapshot
   */
  const createSnapshot = useCallback(async (snapshotName: string, description?: string) => {
    if (!projectId) {
      toast.error('Cannot create snapshot: Project not saved', {
        position: 'bottom-right',
      });
      return { success: false, message: 'Project not saved' };
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createSnapshot',
          projectId,
          snapshotName,
          snapshotDescription: description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create snapshot');
      }

      toast.success('Snapshot created successfully', {
        position: 'bottom-right',
        autoClose: 2000,
      });

      return { success: true, message: 'Snapshot created successfully' };
    } catch (error: any) {
      console.error('Error creating snapshot:', error);
      
      toast.error(`Failed to create snapshot: ${error.message}`, {
        position: 'bottom-right',
        autoClose: 5000,
      });

      return {
        success: false,
        message: error.message || 'Failed to create snapshot',
      };
    }
  }, [projectId]);

  /**
   * Auto-save effect
   */
  useEffect(() => {
    if (!enabled || !autoSaveInterval) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up auto-save
    autoSaveTimerRef.current = setInterval(() => {
      saveProject(false); // Don't show toast for auto-save
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [enabled, autoSaveInterval, saveProject]);

  /**
   * Save on unmount
   */
  useEffect(() => {
    return () => {
      if (enabled && projectData) {
        saveProject(false);
      }
    };
  }, []);

  /**
   * Save on visibility change (when user switches tabs)
   */
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveProject(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, saveProject]);

  /**
   * Save on beforeunload (when user closes tab/window)
   */
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentData = JSON.stringify(projectData);
      
      if (currentData !== lastSavedRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        saveProject(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, projectData, saveProject]);

  return {
    saveProject,
    loadProject,
    createSnapshot,
    isSaving: isSavingRef.current,
    hasUnsavedChanges: JSON.stringify(projectData) !== lastSavedRef.current,
  };
}
