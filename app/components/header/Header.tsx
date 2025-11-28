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
        'flex items-center justify-between px-6 h-[var(--header-height)] bg-[#1A1A1F]/95 backdrop-blur-md',
        {
          'border-b border-transparent': !chat.started,
          'border-b border-white/10': chat.started,
        },
      )}
    >
      {/* Left section - Logo (only visible when logged out or chat started) */}
      <div className="flex items-center gap-3">
        {!authenticated && (
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
              <span className="i-ph:bird-fill text-lg" />
            </div>
            <span className="text-xl font-bold text-white">
              stackbird
            </span>
          </a>
        )}
        {authenticated && !chat.started && <div className="w-[72px]" />}
      </div>

      {/* Center section - Chat description when active */}
      {chat.started ? (
        <div className="flex-1 flex items-center justify-center gap-4 mx-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#25252B] border border-purple-500/30">
            <span className="i-ph:chat-circle-text text-purple-500" />
            <span className="text-sm font-medium text-gray-300 truncate max-w-md">
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25252B] border border-purple-500/30">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-white">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#25252B] transition-all text-sm"
            >
              <span className="i-ph:sign-out text-lg" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 text-sm font-medium text-white hover:text-purple-300 transition-colors rounded-full border border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all text-sm"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
