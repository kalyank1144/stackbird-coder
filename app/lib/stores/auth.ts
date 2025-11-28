import { atom, computed } from 'nanostores';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Auth state atoms
export const currentUser = atom<User | null>(null);
export const authLoading = atom<boolean>(true);
export const authModalOpen = atom<boolean>(false);
export const authModalView = atom<'login' | 'signup'>('login');

// Computed state
export const isAuthenticated = computed(currentUser, (user) => user !== null);

// Demo users for testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'demo@stackbird.com': {
    password: 'demo123',
    user: {
      id: '1',
      email: 'demo@stackbird.com',
      name: 'Demo User',
    },
  },
  'admin@stackbird.com': {
    password: 'admin123',
    user: {
      id: '2',
      email: 'admin@stackbird.com',
      name: 'Admin User',
    },
  },
};

// Auth functions
export function openAuthModal(view: 'login' | 'signup' = 'login') {
  authModalView.set(view);
  authModalOpen.set(true);
}

export function closeAuthModal() {
  authModalOpen.set(false);
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const demoUser = DEMO_USERS[email];

  if (demoUser && demoUser.password === password) {
    currentUser.set(demoUser.user);
    localStorage.setItem('stackbird_user', JSON.stringify(demoUser.user));
    closeAuthModal();

    return { success: true };
  }

  return { success: false, error: 'Invalid email or password' };
}

export async function signup(
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if user exists
  if (DEMO_USERS[email]) {
    return { success: false, error: 'Email already exists' };
  }

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
  };

  currentUser.set(newUser);
  localStorage.setItem('stackbird_user', JSON.stringify(newUser));
  closeAuthModal();

  return { success: true };
}

export function logout() {
  currentUser.set(null);
  localStorage.removeItem('stackbird_user');
}

export function initializeAuth() {
  try {
    const stored = localStorage.getItem('stackbird_user');

    if (stored) {
      const user = JSON.parse(stored);
      currentUser.set(user);
    }
  } catch (e) {
    console.error('Failed to restore auth state:', e);
  }

  authLoading.set(false);
}
