import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePortal } from '../lib/PortalContext';

function Loading() {
  return <div className="wrap" style={{ paddingTop: 80, color: '#5C6B54' }}>Loading…</div>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { role, loading } = usePortal();
  if (loading) return <Loading />;
  if (role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export function RequireStudent({ children }: { children: ReactNode }) {
  const { role, loading, currentStudent } = usePortal();
  if (loading) return <Loading />;
  if (role !== 'student' || !currentStudent) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
