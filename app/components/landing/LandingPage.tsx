import { useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { initializeAuth } from '~/lib/stores/auth';
import { AuthModal } from '~/components/auth/AuthModal';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';

export function LandingPage() {
  useEffect(() => {
    initializeAuth();
  }, []);

  /*
   * Always show the chat interface - both for authenticated and non-authenticated users
   * The Header component will show Sign In / Sign Up buttons for non-authenticated users
   */
  return (
    <div className="flex flex-col h-full w-full bg-stackbird-elements-background-depth-1">
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      <AuthModal />
    </div>
  );
}
