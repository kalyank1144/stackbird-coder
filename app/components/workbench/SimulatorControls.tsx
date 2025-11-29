import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { IconButton } from '~/components/ui/IconButton';
import {
  listSimulators,
  startSimulator,
  stopSimulator,
  deployToSimulator,
  hotReloadSimulator,
  type Simulator,
} from '~/lib/services/simulator.service';

interface SimulatorControlsProps {
  projectPath?: string;
  projectType?: 'expo' | 'flutter' | 'web';
}

export function SimulatorControls({ projectPath, projectType }: SimulatorControlsProps) {
  const [iosSimulators, setIosSimulators] = useState<Simulator[]>([]);
  const [androidSimulators, setAndroidSimulators] = useState<Simulator[]>([]);
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);

  // Only show for mobile projects
  const isMobileProject = projectType === 'expo' || projectType === 'flutter';

  // Load available simulators
  useEffect(() => {
    if (!isMobileProject) {
      return;
    }

    loadSimulators();
  }, [isMobileProject]);

  const loadSimulators = async () => {
    try {
      const [ios, android] = await Promise.all([listSimulators('ios'), listSimulators('android')]);

      setIosSimulators(ios);
      setAndroidSimulators(android);
    } catch (error) {
      console.error('Error loading simulators:', error);
    }
  };

  const handleStartSimulator = async () => {
    if (!selectedSimulator) {
      toast.error('Please select a simulator first');
      return;
    }

    setIsLoading(true);

    try {
      const result = await startSimulator(selectedSimulator.platform, selectedSimulator.id);

      if (result.success) {
        toast.success(result.message);
        setIsSimulatorRunning(true);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start simulator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSimulator = async () => {
    if (!selectedSimulator) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await stopSimulator(selectedSimulator.platform, selectedSimulator.id);

      if (result.success) {
        toast.success(result.message);
        setIsSimulatorRunning(false);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to stop simulator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployApp = async () => {
    if (!selectedSimulator || !projectPath) {
      toast.error('Simulator and project path required');
      return;
    }

    setIsLoading(true);

    try {
      const result = await deployToSimulator(selectedSimulator.platform, selectedSimulator.id, projectPath);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to deploy app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotReload = async () => {
    if (!selectedSimulator) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await hotReloadSimulator(selectedSimulator.platform, selectedSimulator.id);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reload app');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMobileProject) {
    return null;
  }

  const allSimulators = [...iosSimulators, ...androidSimulators];

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-stackbird-elements-background-depth-1 rounded-lg border border-stackbird-elements-borderColor">
      {/* Simulator Selector */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-stackbird-elements-background-depth-2 hover:bg-stackbird-elements-background-depth-3 transition-colors text-stackbird-elements-item-contentDefault border border-stackbird-elements-borderColor">
            <span className="i-ph:device-mobile text-lg" />
            <span>{selectedSimulator ? selectedSimulator.name : 'Select Simulator'}</span>
            <span className="i-ph:caret-down" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[250px] bg-stackbird-elements-background-depth-1 rounded-lg border border-stackbird-elements-borderColor shadow-lg p-1 z-50"
            sideOffset={5}
          >
            {allSimulators.length === 0 ? (
              <div className="px-3 py-2 text-sm text-stackbird-elements-item-contentDimmed">
                No simulators available
              </div>
            ) : (
              <>
                {/* iOS Simulators */}
                {iosSimulators.length > 0 && (
                  <>
                    <div className="px-3 py-1.5 text-xs font-semibold text-stackbird-elements-item-contentDimmed uppercase">
                      iOS Simulators
                    </div>
                    {iosSimulators.map((sim) => (
                      <DropdownMenu.Item
                        key={sim.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-stackbird-elements-background-depth-2 cursor-pointer outline-none text-stackbird-elements-item-contentDefault"
                        onSelect={() => setSelectedSimulator(sim)}
                      >
                        <span className="i-ph:apple-logo" />
                        <span>{sim.name}</span>
                        {sim.status === 'running' && <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />}
                      </DropdownMenu.Item>
                    ))}
                  </>
                )}

                {/* Android Emulators */}
                {androidSimulators.length > 0 && (
                  <>
                    {iosSimulators.length > 0 && (
                      <DropdownMenu.Separator className="h-px bg-stackbird-elements-borderColor my-1" />
                    )}
                    <div className="px-3 py-1.5 text-xs font-semibold text-stackbird-elements-item-contentDimmed uppercase">
                      Android Emulators
                    </div>
                    {androidSimulators.map((sim) => (
                      <DropdownMenu.Item
                        key={sim.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-stackbird-elements-background-depth-2 cursor-pointer outline-none text-stackbird-elements-item-contentDefault"
                        onSelect={() => setSelectedSimulator(sim)}
                      >
                        <span className="i-ph:android-logo" />
                        <span>{sim.name}</span>
                        {sim.status === 'running' && <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />}
                      </DropdownMenu.Item>
                    ))}
                  </>
                )}
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Control Buttons */}
      <div className="flex items-center gap-1">
        {!isSimulatorRunning ? (
          <IconButton
            icon="i-ph:play-fill"
            title="Start Simulator"
            onClick={handleStartSimulator}
            disabled={!selectedSimulator || isLoading}
            className="text-green-500 hover:text-green-400"
          />
        ) : (
          <IconButton
            icon="i-ph:stop-fill"
            title="Stop Simulator"
            onClick={handleStopSimulator}
            disabled={!selectedSimulator || isLoading}
            className="text-red-500 hover:text-red-400"
          />
        )}

        <IconButton
          icon="i-ph:rocket-launch-fill"
          title="Deploy App"
          onClick={handleDeployApp}
          disabled={!selectedSimulator || !isSimulatorRunning || isLoading}
          className="text-purple-500 hover:text-purple-400"
        />

        <IconButton
          icon="i-ph:arrows-clockwise"
          title="Hot Reload"
          onClick={handleHotReload}
          disabled={!selectedSimulator || !isSimulatorRunning || isLoading}
          className="text-blue-500 hover:text-blue-400"
        />

        <IconButton
          icon="i-ph:arrow-clockwise"
          title="Refresh Simulators"
          onClick={loadSimulators}
          disabled={isLoading}
        />
      </div>

      {/* Status Indicator */}
      {selectedSimulator && (
        <div className="flex items-center gap-2 ml-2 px-2 py-1 rounded bg-stackbird-elements-background-depth-4 text-xs">
          <span className={`w-2 h-2 rounded-full ${isSimulatorRunning ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-stackbird-elements-item-contentDimmed">
            {isSimulatorRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      )}
    </div>
  );
}
