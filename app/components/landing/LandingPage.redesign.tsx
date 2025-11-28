import { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { initializeAuth, isAuthenticated } from '~/lib/stores/auth';
import { AuthModal } from '~/components/auth/AuthModal';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header.redesign';
import { HeroSection } from '~/components/landing/HeroSection';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';

export function LandingPage() {
  const authenticated = useStore(isAuthenticated);
  const chat = useStore(chatStore);
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    // Hide hero when chat starts
    if (chat.started) {
      setShowHero(false);
    }
  }, [chat.started]);

  const handleStartChat = (message: string) => {
    // This will be handled by the Chat component
    // For now, just hide the hero
    setShowHero(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1A1A1F]">
      <BackgroundRays />
      <Header />
      
      {/* Show hero section when not authenticated and chat hasn't started */}
      {!authenticated && showHero && !chat.started ? (
        <HeroSection onStartChat={handleStartChat} />
      ) : (
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      )}
      
      <AuthModal />
    </div>
  );
}
