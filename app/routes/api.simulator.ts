import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * API route for mobile simulator operations
 * Handles iOS Simulator and Android Emulator commands
 */

export async function action({ request }: ActionFunctionArgs) {
  const { action, platform, deviceId, projectPath } = await request.json();

  try {
    switch (action) {
      case 'list':
        return await listSimulators(platform);
      
      case 'start':
        return await startSimulator(platform, deviceId);
      
      case 'stop':
        return await stopSimulator(platform, deviceId);
      
      case 'deploy':
        return await deployToSimulator(platform, deviceId, projectPath);
      
      case 'status':
        return await getSimulatorStatus(platform, deviceId);
      
      case 'reload':
        return await hotReloadSimulator(platform, deviceId);
      
      default:
        return json({ success: false, message: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Simulator API error:', error);
    return json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const platform = url.searchParams.get('platform');
  const deviceId = url.searchParams.get('deviceId');

  try {
    if (action === 'list' && platform) {
      return await listSimulators(platform);
    }
    
    if (action === 'status' && platform && deviceId) {
      return await getSimulatorStatus(platform, deviceId);
    }
    
    return json({ success: false, message: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * List available iOS simulators
 */
async function listIOSSimulators() {
  try {
    const { stdout } = await execAsync('xcrun simctl list devices available --json');
    const data = JSON.parse(stdout);
    
    const simulators: any[] = [];
    
    // Parse iOS devices
    Object.entries(data.devices).forEach(([runtime, devices]: [string, any]) => {
      if (runtime.includes('iOS')) {
        (devices as any[]).forEach((device) => {
          if (device.isAvailable) {
            simulators.push({
              id: device.udid,
              name: `${device.name} (${runtime.split('.').pop()})`,
              platform: 'ios',
              status: device.state === 'Booted' ? 'running' : 'stopped',
              deviceType: device.name,
            });
          }
        });
      }
    });
    
    return json({ success: true, simulators });
  } catch (error: any) {
    // If xcrun not found, iOS development not available
    return json({ 
      success: false, 
      message: 'iOS Simulator not available. Install Xcode on macOS.',
      simulators: [] 
    });
  }
}

/**
 * List available Android emulators
 */
async function listAndroidEmulators() {
  try {
    const { stdout } = await execAsync('emulator -list-avds');
    const avds = stdout.trim().split('\n').filter(Boolean);
    
    const simulators = avds.map((avd) => ({
      id: avd,
      name: avd,
      platform: 'android',
      status: 'stopped', // Would need adb to check actual status
      deviceType: avd,
    }));
    
    return json({ success: true, simulators });
  } catch (error: any) {
    return json({ 
      success: false, 
      message: 'Android Emulator not available. Install Android Studio and SDK.',
      simulators: [] 
    });
  }
}

/**
 * List simulators based on platform
 */
async function listSimulators(platform: string) {
  if (platform === 'ios') {
    return await listIOSSimulators();
  } else if (platform === 'android') {
    return await listAndroidEmulators();
  }
  
  return json({ success: false, message: 'Invalid platform' }, { status: 400 });
}

/**
 * Start iOS Simulator
 */
async function startIOSSimulator(deviceId: string) {
  try {
    await execAsync(`xcrun simctl boot ${deviceId}`);
    await execAsync('open -a Simulator');
    
    return json({ 
      success: true, 
      message: 'iOS Simulator started successfully' 
    });
  } catch (error: any) {
    // Device might already be booted
    if (error.message.includes('Unable to boot device in current state: Booted')) {
      await execAsync('open -a Simulator');
      return json({ success: true, message: 'iOS Simulator already running' });
    }
    
    throw error;
  }
}

/**
 * Start Android Emulator
 */
async function startAndroidEmulator(deviceId: string) {
  try {
    // Start emulator in background
    exec(`emulator -avd ${deviceId} &`);
    
    return json({ 
      success: true, 
      message: 'Android Emulator starting...' 
    });
  } catch (error: any) {
    throw error;
  }
}

/**
 * Start simulator based on platform
 */
async function startSimulator(platform: string, deviceId: string) {
  if (platform === 'ios') {
    return await startIOSSimulator(deviceId);
  } else if (platform === 'android') {
    return await startAndroidEmulator(deviceId);
  }
  
  return json({ success: false, message: 'Invalid platform' }, { status: 400 });
}

/**
 * Stop iOS Simulator
 */
async function stopIOSSimulator(deviceId: string) {
  try {
    await execAsync(`xcrun simctl shutdown ${deviceId}`);
    return json({ success: true, message: 'iOS Simulator stopped' });
  } catch (error: any) {
    throw error;
  }
}

/**
 * Stop Android Emulator
 */
async function stopAndroidEmulator(deviceId: string) {
  try {
    await execAsync(`adb -s ${deviceId} emu kill`);
    return json({ success: true, message: 'Android Emulator stopped' });
  } catch (error: any) {
    throw error;
  }
}

/**
 * Stop simulator based on platform
 */
async function stopSimulator(platform: string, deviceId: string) {
  if (platform === 'ios') {
    return await stopIOSSimulator(deviceId);
  } else if (platform === 'android') {
    return await stopAndroidEmulator(deviceId);
  }
  
  return json({ success: false, message: 'Invalid platform' }, { status: 400 });
}

/**
 * Deploy to iOS Simulator
 */
async function deployToIOSSimulator(deviceId: string, projectPath: string) {
  try {
    // For Expo
    await execAsync(`cd ${projectPath} && npx expo start --ios --device-id ${deviceId}`);
    
    // For Flutter
    // await execAsync(`cd ${projectPath} && flutter run -d ${deviceId}`);
    
    return json({ success: true, message: 'App deployed to iOS Simulator' });
  } catch (error: any) {
    throw error;
  }
}

/**
 * Deploy to Android Emulator
 */
async function deployToAndroidEmulator(deviceId: string, projectPath: string) {
  try {
    // For Expo
    await execAsync(`cd ${projectPath} && npx expo start --android --device-id ${deviceId}`);
    
    // For Flutter
    // await execAsync(`cd ${projectPath} && flutter run -d ${deviceId}`);
    
    return json({ success: true, message: 'App deployed to Android Emulator' });
  } catch (error: any) {
    throw error;
  }
}

/**
 * Deploy to simulator based on platform
 */
async function deployToSimulator(platform: string, deviceId: string, projectPath: string) {
  if (platform === 'ios') {
    return await deployToIOSSimulator(deviceId, projectPath);
  } else if (platform === 'android') {
    return await deployToAndroidEmulator(deviceId, projectPath);
  }
  
  return json({ success: false, message: 'Invalid platform' }, { status: 400 });
}

/**
 * Get simulator status
 */
async function getSimulatorStatus(platform: string, deviceId: string) {
  try {
    if (platform === 'ios') {
      const { stdout } = await execAsync(`xcrun simctl list devices | grep ${deviceId}`);
      const isBooted = stdout.includes('Booted');
      
      return json({ 
        success: true, 
        status: isBooted ? 'running' : 'stopped' 
      });
    } else if (platform === 'android') {
      const { stdout } = await execAsync('adb devices');
      const isRunning = stdout.includes(deviceId);
      
      return json({ 
        success: true, 
        status: isRunning ? 'running' : 'stopped' 
      });
    }
    
    return json({ success: false, message: 'Invalid platform' }, { status: 400 });
  } catch (error: any) {
    return json({ success: true, status: 'stopped' });
  }
}

/**
 * Hot reload app in simulator
 */
async function hotReloadSimulator(platform: string, deviceId: string) {
  try {
    if (platform === 'ios' || platform === 'android') {
      // For Expo - send reload command
      await execAsync('npx expo start --dev-client --clear');
      
      return json({ success: true, message: 'App reloaded' });
    }
    
    return json({ success: false, message: 'Invalid platform' }, { status: 400 });
  } catch (error: any) {
    throw error;
  }
}
