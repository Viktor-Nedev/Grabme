import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

export function useProtectedNavigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (targetRoute: string) => {
    if (isAuthenticated) {
      navigate(targetRoute);
      return;
    }

    navigate(`${ROUTES.auth}?redirect=${encodeURIComponent(targetRoute)}`);
  };
}
