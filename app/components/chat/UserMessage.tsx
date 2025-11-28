/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';
import { useStore } from '@nanostores/react';
import { profileStore } from '~/lib/stores/profile';
import type {
  TextUIPart,
  ReasoningUIPart,
  ToolInvocationUIPart,
  SourceUIPart,
  FileUIPart,
  StepStartUIPart,
} from '@ai-sdk/ui-utils';

interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image?: string }>;
  parts:
    | (TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart)[]
    | undefined;
}

export function UserMessage({ content, parts }: UserMessageProps) {
  const profile = useStore(profileStore);

  // Extract images from parts - look for file parts with image mime types
  const images =
    parts?.filter(
      (part): part is FileUIPart => part.type === 'file' && 'mimeType' in part && part.mimeType.startsWith('image/'),
    ) || [];

  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContent = stripMetadata(textItem?.text || '');

    return (
      <div className="overflow-hidden flex flex-col gap-3 items-end ml-auto max-w-[85%]">
        {/* User Avatar & Name */}
        <div className="flex flex-row items-center gap-2 self-end">
          <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{profile?.username || 'You'}</span>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile?.username || 'User'}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="sync"
              />
            ) : (
              <span className="i-ph:user-fill text-white text-sm" />
            )}
          </div>
        </div>
        {/* Message Bubble */}
        <div className="flex flex-col gap-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-lg shadow-purple-500/20">
          {textContent && <Markdown html>{textContent}</Markdown>}
          {images.map((item, index) => (
            <img
              key={index}
              src={`data:${item.mimeType};base64,${item.data}`}
              alt={`Image ${index + 1}`}
              className="max-w-full h-auto rounded-xl border border-white/20"
              style={{ maxHeight: '512px', objectFit: 'contain' }}
            />
          ))}
        </div>
      </div>
    );
  }

  const textContent = stripMetadata(content);

  return (
    <div className="flex flex-col items-end ml-auto max-w-[85%]">
      {/* User Avatar & Name */}
      <div className="flex flex-row items-center gap-2 mb-2">
        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{profile?.username || 'You'}</span>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile?.username || 'User'}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="sync"
            />
          ) : (
            <span className="i-ph:user-fill text-white text-sm" />
          )}
        </div>
      </div>
      {/* Message Bubble */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-lg shadow-purple-500/20">
        {images.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {images.map((item, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden border border-white/20">
                <img
                  src={`data:${item.mimeType};base64,${item.data}`}
                  alt={`Image ${index + 1}`}
                  className="h-16 w-16 object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <Markdown html>{textContent}</Markdown>
      </div>
    </div>
  );
}

function stripMetadata(content: string) {
  const artifactRegex = /<stackbirdArtifact\s+[^>]*>[\s\S]*?<\/stackbirdArtifact>/gm;
  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '').replace(artifactRegex, '');
}
