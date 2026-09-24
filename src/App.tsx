import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PortalProvider } from './lib/PortalContext';
import { RequireAdmin, RequireStudent } from './pages/Guards';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import AdminShell from './pages/admin/AdminShell';
import StudentShell from './pages/student/StudentShell';

export default function App() {
  return (
    <PortalProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route
            path="/admin/*"
            element={
              <RequireAdmin>
                <AdminShell />
              </RequireAdmin>
            }
          />
          <Route
            path="/portal/*"
            element={
              <RequireStudent>
                <StudentShell />
              </RequireStudent>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </PortalProvider>
  );
}
