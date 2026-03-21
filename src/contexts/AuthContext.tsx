import { createContext, useContext, useEffect, useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import type {
  AuthSession,
  LoginInput,
  Organization,
  Profile,
  RegisterInput,
  UserRole,
} from '@/types';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';

interface AuthContextValue {
  session: AuthSession | null;
  currentProfile: Profile | null;
  currentOrganization: Organization | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => { success: boolean; message?: string; redirectTo: string };
  register: (input: RegisterInput) => { success: boolean; message?: string; redirectTo: string };
  loginAsDemo: (role: UserRole) => { success: boolean; redirectTo: string };
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getDashboardRoute(role: UserRole) {
  return role === 'organization' ? ROUTES.orgDashboard : ROUTES.userDashboard;
}

function loadStoredSession() {
  const stored = window.localStorage.getItem(STORAGE_KEYS.auth);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profiles, organizations, createProfile } = useAppData();
  const [session, setSession] = useState<AuthSession | null>(loadStoredSession);

  const currentProfile = session
    ? profiles.find((profile) => profile.id === session.profileId) ?? null
    : null;
  const currentOrganization = currentProfile
    ? organizations.find((organization) => organization.profileId === currentProfile.id) ?? null
    : null;

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.auth);
  }, [session]);

  useEffect(() => {
    if (session && !currentProfile) {
      setSession(null);
    }
  }, [currentProfile, session]);

  const login: AuthContextValue['login'] = ({ email, role }) => {
    const existing = profiles.find(
      (profile) => profile.email.toLowerCase() === email.toLowerCase() && profile.role === role,
    );

    if (!existing) {
      return {
        success: false,
        message: 'No matching account found. Use register or demo login.',
        redirectTo: ROUTES.auth,
      };
    }

    setSession({
      profileId: existing.id,
      role: existing.role,
    });

    return {
      success: true,
      redirectTo: existing.onboardingComplete ? getDashboardRoute(existing.role) : ROUTES.onboarding,
    };
  };

  const register: AuthContextValue['register'] = ({ name, email, role }) => {
    const existing = profiles.find(
      (profile) => profile.email.toLowerCase() === email.toLowerCase() && profile.role === role,
    );

    if (existing) {
      setSession({
        profileId: existing.id,
        role: existing.role,
      });

      return {
        success: true,
        message: 'Existing account found. Continuing to your workspace.',
        redirectTo: existing.onboardingComplete ? getDashboardRoute(existing.role) : ROUTES.onboarding,
      };
    }

    const createdProfile = createProfile({ role, name, email });

    setSession({
      profileId: createdProfile.id,
      role,
    });

    return {
      success: true,
      redirectTo: ROUTES.onboarding,
    };
  };

  const loginAsDemo: AuthContextValue['loginAsDemo'] = (role) => {
    const demoProfile = profiles.find((profile) => profile.role === role && profile.onboardingComplete);

    if (!demoProfile) {
      return {
        success: false,
        redirectTo: ROUTES.auth,
      };
    }

    setSession({
      profileId: demoProfile.id,
      role: demoProfile.role,
    });

    return {
      success: true,
      redirectTo: getDashboardRoute(role),
    };
  };

  const logout = () => {
    setSession(null);
  };

  const refreshSession = () => {
    if (currentProfile) {
      setSession({
        profileId: currentProfile.id,
        role: currentProfile.role,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        currentProfile,
        currentOrganization,
        role: currentProfile?.role ?? null,
        isAuthenticated: Boolean(currentProfile),
        login,
        register,
        loginAsDemo,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
