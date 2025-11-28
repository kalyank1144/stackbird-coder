import { memo, Fragment } from 'react';
import { Markdown } from './Markdown';
import type { JSONValue } from 'ai';
import Popover from '~/components/ui/Popover';
import { workbenchStore } from '~/lib/stores/workbench';
import { WORK_DIR } from '~/utils/constants';
import WithTooltip from '~/components/ui/Tooltip';
import type { Message } from 'ai';
import type { ProviderInfo } from '~/types/model';
import type {
  TextUIPart,
  ReasoningUIPart,
  ToolInvocationUIPart,
  SourceUIPart,
  FileUIPart,
  StepStartUIPart,
} from '@ai-sdk/ui-utils';
import { ToolInvocations } from './ToolInvocations';
import type { ToolCallAnnotation } from '~/types/context';

interface AssistantMessageProps {
  content: string;
  annotations?: JSONValue[];
  messageId?: string;
  onRewind?: (messageId: string) => void;
  onFork?: (messageId: string) => void;
  append?: (message: Message) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  model?: string;
  provider?: ProviderInfo;
  parts:
    | (TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart)[]
    | undefined;
  addToolResult: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
}

function openArtifactInWorkbench(filePath: string) {
  filePath = normalizedFilePath(filePath);

  if (workbenchStore.currentView.get() !== 'code') {
    workbenchStore.currentView.set('code');
  }

  workbenchStore.setSelectedFile(`${WORK_DIR}/${filePath}`);
}

function normalizedFilePath(path: string) {
  let normalizedPath = path;

  if (normalizedPath.startsWith(WORK_DIR)) {
    normalizedPath = path.replace(WORK_DIR, '');
  }

  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.slice(1);
  }

  return normalizedPath;
}

export const AssistantMessage = memo(
  ({
    content,
    annotations,
    messageId,
    onRewind,
    onFork,
    append,
    chatMode,
    setChatMode,
    model,
    provider,
    parts,
    addToolResult,
  }: AssistantMessageProps) => {
    const filteredAnnotations = (annotations?.filter(
      (annotation: JSONValue) =>
        annotation && typeof annotation === 'object' && Object.keys(annotation).includes('type'),
    ) || []) as { type: string; value: any } & { [key: string]: any }[];

    let chatSummary: string | undefined = undefined;

    if (filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')) {
      chatSummary = filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')?.summary;
    }

    let codeContext: string[] | undefined = undefined;

    if (filteredAnnotations.find((annotation) => annotation.type === 'codeContext')) {
      codeContext = filteredAnnotations.find((annotation) => annotation.type === 'codeContext')?.files;
    }

    const usage: {
      completionTokens: number;
      promptTokens: number;
      totalTokens: number;
    } = filteredAnnotations.find((annotation) => annotation.type === 'usage')?.value;

    const toolInvocations = parts?.filter((part) => part.type === 'tool-invocation');
    const toolCallAnnotations = filteredAnnotations.filter(
      (annotation) => annotation.type === 'toolCall',
    ) as ToolCallAnnotation[];

    return (
      <div className="overflow-hidden w-full max-w-[90%]">
        {/* Assistant Header */}
        <div className="flex items-center gap-2 mb-3">
          {/* AI Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="i-ph:bird-fill text-white text-sm" />
          </div>
          <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Stackbird</span>

          {/* Info & Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {(codeContext || chatSummary) && (
              <Popover
                side="right"
                align="start"
                trigger={
                  <button className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="i-ph:info text-slate-500 dark:text-slate-400 text-sm" />
                  </button>
                }
              >
                {chatSummary && (
                  <div className="max-w-chat p-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl">
                    <div className="summary max-h-96 flex flex-col">
                      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                        Summary
                      </h2>
                      <div style={{ zoom: 0.8 }} className="overflow-y-auto">
                        <Markdown>{chatSummary}</Markdown>
                      </div>
                    </div>
                    {codeContext && (
                      <div className="code-context flex flex-col mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Context</h2>
                        <div className="flex gap-2 flex-wrap" style={{ zoom: 0.8 }}>
                          {codeContext.map((x) => {
                            const normalized = normalizedFilePath(x);
                            return (
                              <Fragment key={normalized}>
                                <code
                                  className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg text-xs hover:bg-purple-200 dark:hover:bg-purple-900/60 cursor-pointer transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openArtifactInWorkbench(normalized);
                                  }}
                                >
                                  {normalized}
                                </code>
                              </Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Popover>
            )}

            {usage && (
              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                {usage.totalTokens} tokens
              </span>
            )}

            {(onRewind || onFork) && messageId && (
              <div className="flex gap-1">
                {onRewind && (
                  <WithTooltip tooltip="Revert to this message">
                    <button
                      onClick={() => onRewind(messageId)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-slate-500 dark:text-slate-400"
                    >
                      <span className="i-ph:arrow-u-up-left text-sm" />
                    </button>
                  </WithTooltip>
                )}
                {onFork && (
                  <WithTooltip tooltip="Fork chat from this message">
                    <button
                      onClick={() => onFork(messageId)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-slate-500 dark:text-slate-400"
                    >
                      <span className="i-ph:git-fork text-sm" />
                    </button>
                  </WithTooltip>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-700/50">
          <Markdown
            append={append}
            chatMode={chatMode}
            setChatMode={setChatMode}
            model={model}
            provider={provider}
            html
          >
            {content}
          </Markdown>
        </div>

        {/* Tool Invocations */}
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="mt-3">
            <ToolInvocations
              toolInvocations={toolInvocations}
              toolCallAnnotations={toolCallAnnotations}
              addToolResult={addToolResult}
            />
          </div>
        )}
      </div>
    );
  },
);
