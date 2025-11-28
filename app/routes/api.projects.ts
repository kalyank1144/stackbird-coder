import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { ProjectsService } from '~/lib/supabase/projects.service';

/**
 * GET /api/projects
 * List all projects or get a specific project
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('id');
  const userId = url.searchParams.get('userId');

  try {
    if (projectId) {
      // Get specific project
      const { data, error } = await ProjectsService.getProject(projectId);

      if (error) {
        return json({ error: error.message }, { status: 400 });
      }

      return json({ project: data });
    } else {
      // Get all projects
      const { data, error } = await ProjectsService.getProjects(userId || undefined);

      if (error) {
        return json({ error: error.message }, { status: 400 });
      }

      return json({ projects: data });
    }
  } catch (error: any) {
    console.error('Error in projects loader:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects
 * Create, update, or perform operations on projects
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { action, projectId, projectData, files, snapshotName, snapshotDescription, snapshotId, createdBy } = body;

    switch (action) {
      case 'create': {
        const { data, error } = await ProjectsService.createProject(projectData);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ project: data });
      }

      case 'update': {
        if (!projectId) {
          return json({ error: 'Project ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.updateProject(projectId, projectData);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ project: data });
      }

      case 'delete': {
        if (!projectId) {
          return json({ error: 'Project ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.deleteProject(projectId);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ project: data });
      }

      case 'archive': {
        if (!projectId) {
          return json({ error: 'Project ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.archiveProject(projectId);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ project: data });
      }

      case 'touch': {
        if (!projectId) {
          return json({ error: 'Project ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.touchProject(projectId);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ project: data });
      }

      case 'saveFiles': {
        if (!projectId || !files) {
          return json({ error: 'Project ID and files are required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.saveProjectFiles(projectId, files);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ files: data });
      }

      case 'getFiles': {
        if (!projectId) {
          return json({ error: 'Project ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.getProjectFiles(projectId);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ files: data });
      }

      case 'createSnapshot': {
        if (!projectId || !snapshotName) {
          return json({ error: 'Project ID and snapshot name are required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.createSnapshot(
          projectId,
          snapshotName,
          snapshotDescription,
          createdBy,
        );

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ snapshot: data });
      }

      case 'getSnapshots': {
        if (!projectId) {
          return json({ error: 'Project ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.getSnapshots(projectId);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ snapshots: data });
      }

      case 'restoreSnapshot': {
        if (!snapshotId) {
          return json({ error: 'Snapshot ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.restoreFromSnapshot(snapshotId);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ files: data });
      }

      case 'getStats': {
        if (!projectId) {
          return json({ error: 'Project ID is required' }, { status: 400 });
        }

        const { data, error } = await ProjectsService.getProjectStats(projectId);

        if (error) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ stats: data });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in projects action:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
