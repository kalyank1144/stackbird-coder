import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { ModelSelector } from '~/components/chat/ModelSelector';
import FilePreview from './FilePreview';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { SendButton } from './SendButton.client';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import { SupabaseConnection } from './SupabaseConnection';
import { ExpoQrModal } from '~/components/workbench/ExpoQrModal';
import type { ProviderInfo } from '~/types/model';
import { ColorSchemeDialog } from '~/components/ui/ColorSchemeDialog';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import { McpTools } from './MCPTools';

interface ChatBoxProps {
  isModelSettingsCollapsed: boolean;
  setIsModelSettingsCollapsed: (collapsed: boolean) => void;
  provider: any;
  providerList: any[];
  modelList: any[];
  apiKeys: Record<string, string>;
  isModelLoading: string | undefined;
  onApiKeysChange: (providerName: string, apiKey: string) => void;
  uploadedFiles: File[];
  imageDataList: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement> | undefined;
  input: string;
  handlePaste: (e: React.ClipboardEvent) => void;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  isStreaming: boolean;
  handleSendMessage: (event: React.UIEvent, messageInput?: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  chatStarted: boolean;
  exportChat?: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  handleFileUpload: () => void;
  setProvider?: ((provider: ProviderInfo) => void) | undefined;
  model?: string | undefined;
  setModel?: ((model: string) => void) | undefined;
  setUploadedFiles?: ((files: File[]) => void) | undefined;
  setImageDataList?: ((dataList: string[]) => void) | undefined;
  handleInputChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  handleStop?: (() => void) | undefined;
  enhancingPrompt?: boolean | undefined;
  enhancePrompt?: (() => void) | undefined;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: ((element: ElementInfo | null) => void) | undefined;
}

export const ChatBox: React.FC<ChatBoxProps> = (props) => {
  return (
    <div
      className={classNames(
        'relative bg-stackbird-elements-background-depth-2 p-3 rounded-lg border border-stackbird-elements-borderColor shadow-sm relative w-full max-w-chat mx-auto z-prompt',
      )}
    >
      <div>
        <ClientOnly>
          {() => (
            <div className={props.isModelSettingsCollapsed ? 'hidden' : ''}>
              <ModelSelector
                key={props.provider?.name + ':' + props.modelList.length}
                model={props.model}
                setModel={props.setModel}
                modelList={props.modelList}
                provider={props.provider}
                setProvider={props.setProvider}
                providerList={props.providerList || (PROVIDER_LIST as ProviderInfo[])}
                apiKeys={props.apiKeys}
                modelLoading={props.isModelLoading}
              />
            </div>
          )}
        </ClientOnly>
      </div>
      <FilePreview
        files={props.uploadedFiles}
        imageDataList={props.imageDataList}
        onRemove={(index) => {
          props.setUploadedFiles?.(props.uploadedFiles.filter((_, i) => i !== index));
          props.setImageDataList?.(props.imageDataList.filter((_, i) => i !== index));
        }}
      />
      <ClientOnly>
        {() => (
          <ScreenshotStateManager
            setUploadedFiles={props.setUploadedFiles}
            setImageDataList={props.setImageDataList}
            uploadedFiles={props.uploadedFiles}
            imageDataList={props.imageDataList}
          />
        )}
      </ClientOnly>
      {props.selectedElement && (
        <div className="flex mx-1.5 gap-2 items-center justify-between rounded-lg rounded-b-none border border-b-none border-stackbird-elements-borderColor text-stackbird-elements-textPrimary flex py-1 px-2.5 font-medium text-xs">
          <div className="flex gap-2 items-center lowercase">
            <code className="bg-stackbird-elements-background-depth-3 rounded-sm px-1.5 py-1 mr-0.5 text-stackbird-elements-textPrimary">
              {props?.selectedElement?.tagName}
            </code>
            selected for inspection
          </div>
          <button
            className="bg-transparent text-stackbird-elements-textSecondary hover:text-stackbird-elements-textPrimary pointer-auto"
            onClick={() => props.setSelectedElement?.(null)}
          >
            Clear
          </button>
        </div>
      )}
      <div
        className={classNames(
          'relative border border-stackbird-elements-borderColor rounded-lg bg-stackbird-elements-background-depth-1',
        )}
      >
        <textarea
          ref={props.textareaRef}
          className={classNames(
            'w-full pl-4 pt-4 pr-16 outline-none resize-none text-stackbird-elements-textPrimary placeholder-stackbird-elements-textTertiary bg-transparent text-sm',
            'transition-all duration-200',
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid var(--stackbird-elements-borderColorActive)';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '2px solid var(--stackbird-elements-borderColorActive)';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid var(--stackbird-elements-borderColor)';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.border = '1px solid var(--stackbird-elements-borderColor)';

            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                  const base64Image = e.target?.result as string;
                  props.setUploadedFiles?.([...props.uploadedFiles, file]);
                  props.setImageDataList?.([...props.imageDataList, base64Image]);
                };
                reader.readAsDataURL(file);
              }
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (event.shiftKey) {
                return;
              }

              event.preventDefault();

              if (props.isStreaming) {
                props.handleStop?.();
                return;
              }

              // ignore if using input method engine
              if (event.nativeEvent.isComposing) {
                return;
              }

              props.handleSendMessage?.(event);
            }
          }}
          value={props.input}
          onChange={(event) => {
            props.handleInputChange?.(event);
          }}
          onPaste={props.handlePaste}
          style={{
            minHeight: props.TEXTAREA_MIN_HEIGHT,
            maxHeight: props.TEXTAREA_MAX_HEIGHT,
          }}
          placeholder={
            props.chatMode === 'build' ? 'How can Stackbird help you today?' : 'What would you like to discuss?'
          }
          translate="no"
        />
        <ClientOnly>
          {() => (
            <SendButton
              show={props.input.length > 0 || props.isStreaming || props.uploadedFiles.length > 0}
              isStreaming={props.isStreaming}
              disabled={!props.providerList || props.providerList.length === 0}
              onClick={(event) => {
                if (props.isStreaming) {
                  props.handleStop?.();
                  return;
                }

                if (props.input.length > 0 || props.uploadedFiles.length > 0) {
                  props.handleSendMessage?.(event);
                }
              }}
            />
          )}
        </ClientOnly>
        <div className="flex justify-between items-center text-sm px-3 py-2">
          <div className="flex gap-1 items-center">
            <ColorSchemeDialog designScheme={props.designScheme} setDesignScheme={props.setDesignScheme} />
            <McpTools />
            <IconButton
              title="Upload file"
              className="transition-all hover:bg-stackbird-elements-background-depth-3 hover:text-stackbird-elements-textPrimary rounded-md text-stackbird-elements-textSecondary"
              onClick={() => props.handleFileUpload()}
            >
              <div className="i-ph:paperclip text-lg"></div>
            </IconButton>
            <IconButton
              title="Enhance prompt"
              disabled={props.input.length === 0 || props.enhancingPrompt}
              className={classNames(
                'transition-all hover:bg-stackbird-elements-background-depth-3 hover:text-stackbird-elements-textPrimary rounded-md text-stackbird-elements-textSecondary',
                props.enhancingPrompt ? 'opacity-100' : '',
              )}
              onClick={() => {
                props.enhancePrompt?.();
                toast.success('Prompt enhanced!');
              }}
            >
              {props.enhancingPrompt ? (
                <div className="i-svg-spinners:90-ring-with-bg text-stackbird-elements-textPrimary text-lg animate-spin"></div>
              ) : (
                <div className="i-stackbird:stars text-lg"></div>
              )}
            </IconButton>

            <SpeechRecognitionButton
              isListening={props.isListening}
              onStart={props.startListening}
              onStop={props.stopListening}
              disabled={props.isStreaming}
            />
            {props.chatStarted && (
              <IconButton
                title="Discuss"
                className={classNames(
                  'transition-all flex items-center gap-1 px-2 rounded-md',
                  props.chatMode === 'discuss'
                    ? 'bg-stackbird-elements-background-depth-3 text-stackbird-elements-textPrimary'
                    : 'hover:bg-stackbird-elements-background-depth-3 text-stackbird-elements-textSecondary',
                )}
                onClick={() => {
                  props.setChatMode?.(props.chatMode === 'discuss' ? 'build' : 'discuss');
                }}
              >
                <div className={`i-ph:chats text-lg`} />
                {props.chatMode === 'discuss' ? <span className="text-xs font-medium">Discuss</span> : <span />}
              </IconButton>
            )}
          </div>
          {props.input.length > 3 ? (
            <div className="text-xs text-stackbird-elements-textTertiary hidden sm:block">
              <kbd className="px-1.5 py-0.5 rounded bg-stackbird-elements-background-depth-3 text-stackbird-elements-textSecondary font-mono text-[10px]">
                Shift
              </kbd>{' '}
              +{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-stackbird-elements-background-depth-3 text-stackbird-elements-textSecondary font-mono text-[10px]">
                Enter
              </kbd>{' '}
              for new line
            </div>
          ) : null}
          <SupabaseConnection />
          <ExpoQrModal open={props.qrModalOpen} onClose={() => props.setQrModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};
