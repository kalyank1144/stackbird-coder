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
        'flex items-center justify-between px-8 h-[70px] bg-[#1A1A1F]/80 backdrop-blur-md',
        {
          'border-b border-transparent': !chat.started,
          'border-b border-white/10': chat.started,
        },
      )}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left section - Logo */}
      <div className="flex items-center gap-3">
        {!authenticated && (
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg transition-all group-hover:shadow-purple-500/50">
              <span className="i-ph:bird-fill text-xl" />
            </div>
            <span className="text-2xl font-bold text-white">
              Stackbird
            </span>
          </a>
        )}
        {authenticated && !chat.started && <div className="w-[140px]" />}
      </div>

      {/* Center section - Navigation or Chat description */}
      {chat.started ? (
        <div className="flex-1 flex items-center justify-center gap-4 mx-4">
          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#25252B] border border-purple-500/30">
            <span className="i-ph:chat-circle-text text-purple-400 text-lg" />
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
        <nav className="flex-1 flex items-center justify-center gap-8">
          <a
            href="#features"
            className="text-gray-400 hover:text-white transition-colors text-base font-medium"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-400 hover:text-white transition-colors text-base font-medium"
          >
            Pricing
          </a>
          <a
            href="#docs"
            className="text-gray-400 hover:text-white transition-colors text-base font-medium"
          >
            Docs
          </a>
        </nav>
      )}

      {/* Right section - Auth */}
      <div className="flex items-center gap-3">
        {authenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-[#25252B] border border-purple-500/30">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-white">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#25252B] transition-all text-sm font-medium"
            >
              <span className="i-ph:sign-out text-lg" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2.5 text-sm font-medium text-white hover:text-purple-300 transition-colors rounded-full border border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all text-sm"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
