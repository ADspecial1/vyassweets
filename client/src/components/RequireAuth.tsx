import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import Spinner from './Spinner';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
