import { useStore } from '@nanostores/react';
import { memo, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import * as Tabs from '@radix-ui/react-tabs';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type EditorSettings,
  type OnChangeCallback as OnEditorChange,
  type OnSaveCallback as OnEditorSave,
  type OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import type { FileMap } from '~/lib/stores/files';
import type { FileHistory } from '~/types/actions';
import { themeStore } from '~/lib/stores/theme';
import { WORK_DIR } from '~/utils/constants';
import { renderLogger } from '~/utils/logger';
import { isMobile } from '~/utils/mobile';
import { FileBreadcrumb } from './FileBreadcrumb';
import { FileTree } from './FileTree';
import { DEFAULT_TERMINAL_SIZE, TerminalTabs } from './terminal/TerminalTabs';
import { workbenchStore } from '~/lib/stores/workbench';
import { Search } from './Search'; // <-- Ensure Search is imported
import { classNames } from '~/utils/classNames'; // <-- Import classNames if not already present
import { LockManager } from './LockManager'; // <-- Import LockManager

interface EditorPanelProps {
  files?: FileMap;
  unsavedFiles?: Set<string>;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  fileHistory?: Record<string, FileHistory>;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
  onFileSave?: OnEditorSave;
  onFileReset?: () => void;
}

const DEFAULT_EDITOR_SIZE = 100 - DEFAULT_TERMINAL_SIZE;

const editorSettings: EditorSettings = { tabSize: 2 };

export const EditorPanel = memo(
  ({
    files,
    unsavedFiles,
    editorDocument,
    selectedFile,
    isStreaming,
    fileHistory,
    onFileSelect,
    onEditorChange,
    onEditorScroll,
    onFileSave,
    onFileReset,
  }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const theme = useStore(themeStore);
    const showTerminal = useStore(workbenchStore.showTerminal);

    const activeFileSegments = useMemo(() => {
      if (!editorDocument) {
        return undefined;
      }

      return editorDocument.filePath.split('/');
    }, [editorDocument]);

    const activeFileUnsaved = useMemo(() => {
      if (!editorDocument || !unsavedFiles) {
        return false;
      }

      // Make sure unsavedFiles is a Set before calling has()
      return unsavedFiles instanceof Set && unsavedFiles.has(editorDocument.filePath);
    }, [editorDocument, unsavedFiles]);

    return (
      <PanelGroup direction="vertical">
        <Panel defaultSize={showTerminal ? DEFAULT_EDITOR_SIZE : 100} minSize={20}>
          <PanelGroup direction="horizontal">
            {/* File Explorer Panel - Modern Styling */}
            <Panel
              defaultSize={20}
              minSize={15}
              collapsible
              className="border-r border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="h-full bg-slate-50/50 dark:bg-slate-900/50">
                <Tabs.Root defaultValue="files" className="flex flex-col h-full">
                  {/* Tab Header */}
                  <div className="px-2 py-2 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
                    <Tabs.List className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Tabs.Trigger
                        value="files"
                        className={classNames(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                          'text-slate-500 dark:text-slate-400',
                          'hover:text-slate-700 dark:hover:text-slate-200',
                          'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700',
                          'data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400',
                          'data-[state=active]:shadow-sm',
                        )}
                      >
                        <span className="i-ph:folder-simple" />
                        Files
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="search"
                        className={classNames(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                          'text-slate-500 dark:text-slate-400',
                          'hover:text-slate-700 dark:hover:text-slate-200',
                          'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700',
                          'data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400',
                          'data-[state=active]:shadow-sm',
                        )}
                      >
                        <span className="i-ph:magnifying-glass" />
                        Search
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="locks"
                        className={classNames(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                          'text-slate-500 dark:text-slate-400',
                          'hover:text-slate-700 dark:hover:text-slate-200',
                          'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700',
                          'data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400',
                          'data-[state=active]:shadow-sm',
                        )}
                      >
                        <span className="i-ph:lock-simple" />
                        Locks
                      </Tabs.Trigger>
                    </Tabs.List>
                  </div>

                  <Tabs.Content
                    value="files"
                    className="flex-grow overflow-auto focus-visible:outline-none modern-scrollbar"
                  >
                    <FileTree
                      className="h-full"
                      files={files}
                      hideRoot
                      unsavedFiles={unsavedFiles}
                      fileHistory={fileHistory}
                      rootFolder={WORK_DIR}
                      selectedFile={selectedFile}
                      onFileSelect={onFileSelect}
                    />
                  </Tabs.Content>

                  <Tabs.Content
                    value="search"
                    className="flex-grow overflow-auto focus-visible:outline-none modern-scrollbar"
                  >
                    <Search />
                  </Tabs.Content>

                  <Tabs.Content
                    value="locks"
                    className="flex-grow overflow-auto focus-visible:outline-none modern-scrollbar"
                  >
                    <LockManager />
                  </Tabs.Content>
                </Tabs.Root>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-transparent hover:bg-purple-500/30 transition-colors" />

            {/* Code Editor Panel */}
            <Panel className="flex flex-col" defaultSize={80} minSize={20}>
              {/* File Breadcrumb Header */}
              <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
                {activeFileSegments?.length && (
                  <div className="flex items-center flex-1 text-sm">
                    <FileBreadcrumb pathSegments={activeFileSegments} files={files} onFileSelect={onFileSelect} />
                    {activeFileUnsaved && (
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={onFileSave}
                          className={classNames(
                            'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                            'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
                            'hover:bg-emerald-200 dark:hover:bg-emerald-900/60',
                          )}
                        >
                          <span className="i-ph:floppy-disk" />
                          Save
                        </button>
                        <button
                          onClick={onFileReset}
                          className={classNames(
                            'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                            'hover:bg-slate-200 dark:hover:bg-slate-600',
                          )}
                        >
                          <span className="i-ph:clock-counter-clockwise" />
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Code Editor */}
              <div className="h-full flex-1 overflow-hidden modern-scrollbar bg-white dark:bg-slate-900">
                <CodeMirrorEditor
                  theme={theme}
                  editable={!isStreaming && editorDocument !== undefined}
                  settings={editorSettings}
                  doc={editorDocument}
                  autoFocusOnDocumentChange={!isMobile()}
                  onScroll={onEditorScroll}
                  onChange={onEditorChange}
                  onSave={onFileSave}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="h-1 bg-transparent hover:bg-purple-500/30 transition-colors" />
        <TerminalTabs />
      </PanelGroup>
    );
  },
);
