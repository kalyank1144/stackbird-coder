/**
 * Mobile Simulator Service
 * Handles iOS Simulator and Android Emulator integration
 */

export type SimulatorPlatform = 'ios' | 'android';
export type SimulatorStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface Simulator {
  id: string;
  name: string;
  platform: SimulatorPlatform;
  status: SimulatorStatus;
  deviceType: string;
}

export interface SimulatorServiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Get list of available simulators/emulators
 */
export async function listSimulators(platform: SimulatorPlatform): Promise<Simulator[]> {
  try {
    const response = await fetch(`/api/simulator/list?platform=${platform}`);

    if (!response.ok) {
      throw new Error('Failed to fetch simulators');
    }

    const data = (await response.json()) as { simulators?: Simulator[] };

    return data.simulators || [];
  } catch (error) {
    console.error('Error listing simulators:', error);
    return [];
  }
}

/**
 * Start a simulator/emulator
 */
export async function startSimulator(platform: SimulatorPlatform, deviceId: string): Promise<SimulatorServiceResponse> {
  try {
    const response = await fetch('/api/simulator/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, deviceId }),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      throw new Error(data.message || 'Failed to start simulator');
    }

    return {
      success: true,
      message: `${platform === 'ios' ? 'iOS Simulator' : 'Android Emulator'} started successfully`,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to start simulator',
    };
  }
}

/**
 * Stop a running simulator/emulator
 */
export async function stopSimulator(platform: SimulatorPlatform, deviceId: string): Promise<SimulatorServiceResponse> {
  try {
    const response = await fetch('/api/simulator/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, deviceId }),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      throw new Error(data.message || 'Failed to stop simulator');
    }

    return {
      success: true,
      message: 'Simulator stopped successfully',
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to stop simulator',
    };
  }
}

/**
 * Deploy app to simulator/emulator
 */
export async function deployToSimulator(
  platform: SimulatorPlatform,
  deviceId: string,
  projectPath: string,
): Promise<SimulatorServiceResponse> {
  try {
    const response = await fetch('/api/simulator/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, deviceId, projectPath }),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      throw new Error(data.message || 'Failed to deploy to simulator');
    }

    return {
      success: true,
      message: 'App deployed successfully',
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to deploy to simulator',
    };
  }
}

/**
 * Get simulator status
 */
export async function getSimulatorStatus(platform: SimulatorPlatform, deviceId: string): Promise<SimulatorStatus> {
  try {
    const response = await fetch(`/api/simulator/status?platform=${platform}&deviceId=${deviceId}`);

    if (!response.ok) {
      return 'error';
    }

    const data = (await response.json()) as { status?: SimulatorStatus };

    return data.status || 'stopped';
  } catch (error) {
    console.error('Error getting simulator status:', error);
    return 'error';
  }
}

/**
 * Hot reload app in simulator
 */
export async function hotReloadSimulator(
  platform: SimulatorPlatform,
  deviceId: string,
): Promise<SimulatorServiceResponse> {
  try {
    const response = await fetch('/api/simulator/reload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, deviceId }),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reload app');
    }

    return {
      success: true,
      message: 'App reloaded successfully',
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to reload app',
    };
  }
}
