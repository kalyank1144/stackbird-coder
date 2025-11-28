import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { authModalOpen, authModalView, closeAuthModal, login, signup } from '~/lib/stores/auth';

export function AuthModal() {
  const isOpen = useStore(authModalOpen);
  const view = useStore(authModalView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        const result = await login(email, password);

        if (!result.success) {
          setError(result.error || 'Login failed');
        }
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);

          return;
        }

        const result = await signup(email, password, name);

        if (!result.success) {
          setError(result.error || 'Signup failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchView = () => {
    setError('');
    authModalView.set(view === 'login' ? 'signup' : 'login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeAuthModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800/50 shadow-2xl shadow-purple-500/10 overflow-hidden"
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />

            {/* Close button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <div className="i-ph:x text-lg" />
            </button>

            {/* Content */}
            <div className="p-8 pt-10">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="i-ph:bird-fill text-2xl text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                {view === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-400 text-center mb-8">
                {view === 'login' ? 'Sign in to continue building with AI' : 'Start building amazing apps today'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Full name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="i-ph:warning-circle text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="i-ph:spinner animate-spin" />
                      Please wait...
                    </span>
                  ) : view === 'login' ? (
                    'Sign in'
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-500">
                  {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={switchView}
                    className="ml-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    {view === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
