import { useState } from 'react';
import { classNames } from '~/utils/classNames';

const THEMES = [
  {
    id: 'pure-light',
    name: 'Pure Light',
    description: 'High contrast, stark white, professional.',
    colors: {
      '--bg-primary': '#FFFFFF',
      '--bg-secondary': '#F4F4F5',
      '--text-primary': '#09090B',
      '--text-secondary': '#71717A',
      '--border-primary': '#E4E4E7',
      '--accent-primary': '#18181B',
    },
  },
  {
    id: 'soft-paper',
    name: 'Soft Paper',
    description: 'Warm off-white, easy on the eyes.',
    colors: {
      '--bg-primary': '#FDFBF7',
      '--bg-secondary': '#F5F2EB',
      '--text-primary': '#44403C',
      '--text-secondary': '#78716C',
      '--border-primary': '#E7E5E4',
      '--accent-primary': '#57534E',
    },
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Cool slate tones, trustworthy blue accents.',
    colors: {
      '--bg-primary': '#F8FAFC',
      '--bg-secondary': '#F1F5F9',
      '--text-primary': '#0F172A',
      '--text-secondary': '#64748B',
      '--border-primary': '#E2E8F0',
      '--accent-primary': '#3B82F6',
    },
  },
  {
    id: 'modern-gray',
    name: 'Modern Gray',
    description: 'Neutral grays, balanced and clean.',
    colors: {
      '--bg-primary': '#F9FAFB',
      '--bg-secondary': '#F3F4F6',
      '--text-primary': '#111827',
      '--text-secondary': '#6B7280',
      '--border-primary': '#E5E7EB',
      '--accent-primary': '#374151',
    },
  },
];

export default function ThemeDemo() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Choose Your Theme</h1>
          <p className="text-xl text-gray-600">Select a palette to preview the "Lite & Minimal" look.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={classNames(
                'p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg',
                selectedTheme.id === theme.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
                  : 'border-transparent bg-white shadow-sm hover:border-gray-200',
              )}
            >
              <div className="flex gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
                  style={{ backgroundColor: theme.colors['--bg-primary'] }}
                />
                <div
                  className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
                  style={{ backgroundColor: theme.colors['--bg-secondary'] }}
                />
                <div
                  className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
                  style={{ backgroundColor: theme.colors['--accent-primary'] }}
                />
              </div>
              <h3 className="text-lg font-bold mb-1">{theme.name}</h3>
              <p className="text-sm text-gray-500">{theme.description}</p>
            </button>
          ))}
        </div>

        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 text-center text-xs font-medium text-gray-500">Preview: {selectedTheme.name}</div>
          </div>

          <div className="p-8 transition-colors duration-300" style={selectedTheme.colors as React.CSSProperties}>
            {/* Simulated App Interface */}
            <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
              {/* Header */}
              <header className="h-16 border-b border-[var(--border-primary)] flex items-center justify-between px-6 bg-[var(--bg-primary)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)]">
                    <span className="i-ph:bird-fill text-lg" />
                  </div>
                  <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    stackbird
                  </span>
                </div>
                <div className="flex gap-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <span>Product</span>
                  <span>Solutions</span>
                  <span>Pricing</span>
                </div>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                  }}
                >
                  Get Started
                </button>
              </header>

              {/* Main Content */}
              <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-64 border-r border-[var(--border-primary)] p-4 hidden md:flex flex-col gap-2 bg-[var(--bg-secondary)]">
                  {['Dashboard', 'Projects', 'Tasks', 'Settings'].map((item, i) => (
                    <div
                      key={item}
                      className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                        i === 0 ? 'bg-[var(--bg-primary)] shadow-sm' : 'hover:bg-[var(--bg-primary)]'
                      }`}
                      style={{
                        color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: i === 0 ? '1px solid var(--border-primary)' : '1px solid transparent',
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 bg-[var(--bg-primary)]">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Welcome back
                    </h2>
                    <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                      Here's what's happening with your projects today.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="p-6 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                        >
                          <div
                            className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
                            style={{ backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <span className="i-ph:folder text-xl" style={{ color: 'var(--text-primary)' }} />
                          </div>
                          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Project Alpha
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Last updated 2h ago
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Chat Input Simulation */}
                    <div
                      className="rounded-xl border border-[var(--border-primary)] p-4 shadow-sm"
                      style={{ backgroundColor: 'var(--bg-primary)' }}
                    >
                      <textarea
                        className="w-full bg-transparent outline-none resize-none h-24 text-sm"
                        placeholder="Ask anything..."
                        style={{ color: 'var(--text-primary)' }}
                      />
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--border-primary)]">
                        <div className="flex gap-2">
                          <button
                            className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <span className="i-ph:paperclip text-lg" />
                          </button>
                        </div>
                        <button
                          className="px-3 py-1.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--bg-primary)',
                          }}
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
