import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { useProjectPersistence } from '~/lib/hooks/useProjectPersistence';
import { toast } from 'react-toastify';

interface WorkbenchPersistenceProps {
  chatId?: string;
  projectName?: string;
}

/**
 * Component that handles automatic project persistence for the workbench
 * This monitors file changes and auto-saves to Supabase
 */
export function WorkbenchPersistence({ chatId, projectName }: WorkbenchPersistenceProps) {
  const files = useStore(workbenchStore.files);
  const [projectId, setProjectId] = useState<string | undefined>();

  // Convert workbench files to project data format

  const projectData = {
    name: projectName || `Project ${chatId || 'Untitled'}`,
    description: `Auto-saved project from chat ${chatId}`,
    template_type: 'custom',
    language: 'typescript',
    files: Object.entries(files).map(([path, dirent]) => ({
      path,
      name: path.split('/').pop() || path,
      content: dirent.content || '',
      type: dirent.type,
    })),
    metadata: {
      chatId,
      lastModified: new Date().toISOString(),
    },
    tags: ['auto-saved'],
  };

  const { saveProject, hasUnsavedChanges, isSaving } = useProjectPersistence(projectData, {
    projectId,
    autoSaveInterval: 30000, // Auto-save every 30 seconds
    enabled: true,
  });

  // Manual save shortcut (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  // Show unsaved changes indicator
  useEffect(() => {
    if (hasUnsavedChanges) {
      // Update document title to show unsaved changes
      const originalTitle = document.title;
      document.title = `● ${originalTitle}`;
      
      return () => {
        document.title = originalTitle;
      };
    }
  }, [hasUnsavedChanges]);

  return null; // This is a logic-only component
}
