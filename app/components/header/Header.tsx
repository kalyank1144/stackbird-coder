import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { isAuthenticated, currentUser, openAuthModal, logout } from '~/lib/stores/auth';

export function Header() {
  const chat = useStore(chatStore);
  const authenticated = useStore(isAuthenticated);
  const user = useStore(currentUser);

  return (
    <header
      className={classNames(
        'flex items-center justify-between px-6 h-[var(--header-height)] bg-stackbird-elements-background-depth-1 border-b border-stackbird-elements-borderColor',
      )}
    >
      {/* Left section - Logo (only visible when logged out or chat started) */}
      <div className="flex items-center gap-3">
        {!authenticated && (
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-stackbird-elements-textPrimary text-stackbird-elements-background-depth-1">
              <span className="i-ph:bird-fill text-lg" />
            </div>
            <span className="text-lg font-bold text-stackbird-elements-textPrimary">stackbird</span>
          </a>
        )}
        {authenticated && !chat.started && <div className="w-[72px]" />}
      </div>

      {/* Center section - Chat description when active */}
      {chat.started ? (
        <div className="flex-1 flex items-center justify-center gap-4 mx-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-stackbird-elements-background-depth-2 border border-stackbird-elements-borderColor">
            <span className="i-ph:chat-circle-text text-stackbird-elements-textSecondary" />
            <span className="text-sm font-medium text-stackbird-elements-textSecondary truncate max-w-md">
              <ClientOnly>{() => <ChatDescription />}</ClientOnly>
            </span>
          </div>
          <ClientOnly>
            {() => (
              <div className="flex items-center">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </div>
      ) : (
        <span className="flex-1" />
      )}

      {/* Right section - Auth */}
      <div className="flex items-center gap-3">
        {authenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-stackbird-elements-background-depth-2 border border-stackbird-elements-borderColor">
              <div className="w-5 h-5 rounded-full bg-stackbird-elements-textPrimary flex items-center justify-center text-stackbird-elements-background-depth-1 text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-stackbird-elements-textPrimary">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-stackbird-elements-textSecondary hover:text-stackbird-elements-textPrimary hover:bg-stackbird-elements-background-depth-2 transition-all text-sm"
            >
              <span className="i-ph:sign-out text-lg" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 text-sm font-medium text-stackbird-elements-textSecondary hover:text-stackbird-elements-textPrimary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-4 py-2 bg-stackbird-elements-textPrimary text-stackbird-elements-background-depth-1 font-semibold rounded-md hover:bg-white/90 transition-all text-sm"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
