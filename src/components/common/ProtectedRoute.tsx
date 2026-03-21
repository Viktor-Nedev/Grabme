import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { ROUTES } from '@/utils/constants';

export function ProtectedRoute({ allowBeforeOnboarding = false }: { allowBeforeOnboarding?: boolean }) {
  const location = useLocation();
  const { currentProfile, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${ROUTES.auth}?redirect=${redirect}`} replace />;
  }

  if (!allowBeforeOnboarding && currentProfile && !currentProfile.onboardingComplete) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <Outlet />;
}

export function RoleProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { currentProfile } = useAuth();

  if (!currentProfile) {
    return <Navigate to={ROUTES.auth} replace />;
  }

  if (!allowedRoles.includes(currentProfile.role)) {
    return (
      <Navigate
        to={currentProfile.role === 'organization' ? ROUTES.orgDashboard : ROUTES.userDashboard}
        replace
      />
    );
  }

  return <Outlet />;
}
