import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { ParticleBird } from '~/components/ui/ParticleBird';

interface HeroSectionProps {
  onStartChat?: (message: string) => void;
}

export function HeroSection({ onStartChat }: HeroSectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onStartChat) {
      onStartChat(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] flex items-center justify-center px-8 py-20 overflow-hidden">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left side - Content */}
        <div className="space-y-8">
          {/* Headline */}
          <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-white">What will you </span>
            <span 
              className="bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent"
              style={{ fontStyle: 'italic' }}
            >
              build
            </span>
            <span className="text-white"> today?</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-xl">
            Create stunning apps & websites by chatting with AI
          </p>

          {/* Input field with Build button */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Let's build an MVP for my startup that..."
              className="w-full h-16 px-6 pr-32 bg-[#25252B] border border-white/10 rounded-3xl text-white placeholder-gray-500 text-base focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              Build now
            </button>
          </form>

          {/* Import buttons */}
          <div className="flex items-center gap-4">
            <button className="px-5 py-2.5 bg-transparent border border-purple-500/30 hover:border-purple-500/60 text-white rounded-full text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2">
              <span className="i-ph:github-logo text-lg" />
              Import from GitHub
            </button>
            <button className="px-5 py-2.5 bg-transparent border border-purple-500/30 hover:border-purple-500/60 text-white rounded-full text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2">
              <span className="i-ph:figma-logo text-lg" />
              Import from Figma
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-8">
            <p className="text-sm text-gray-500 mb-4">Trusted by</p>
            <div className="flex items-center gap-8 opacity-50">
              <div className="text-gray-600 font-semibold">TechCorp</div>
              <div className="text-gray-600 font-semibold">DevFlow</div>
              <div className="text-gray-600 font-semibold">InnovateX</div>
              <div className="text-gray-600 font-semibold">Handing</div>
            </div>
          </div>
        </div>

        {/* Right side - Particle Bird Animation */}
        <div className="hidden lg:flex items-center justify-center">
          <div id="particle-bird-container" className="w-full h-[600px] relative">
            <ClientOnly fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-purple-500/20 text-9xl animate-pulse">
                  <span className="i-ph:bird-fill" />
                </div>
              </div>
            }>
              {() => <ParticleBird />}
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  );
}
