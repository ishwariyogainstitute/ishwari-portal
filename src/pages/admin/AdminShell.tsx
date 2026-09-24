import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { PortalFlash } from '../../components/Common';
import AdminCourses from './AdminCourses';
import AdminStudents from './AdminStudents';
import AdminEnrollments from './AdminEnrollments';
import AdminReports from './AdminReports';
import AdminResults from './AdminResults';
import AdminSettings from './AdminSettings';
import AdminExport from './AdminExport';

function NavBtn({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
      {children}
    </NavLink>
  );
}

export default function AdminShell() {
  return (
    <>
      <TopBar showLogout />
      <div className="shell">
        <div className="nav">
          <div className="navlabel">ADMIN</div>
          <NavBtn to="courses">Courses</NavBtn>
          <NavBtn to="students">Registrations</NavBtn>
          <NavBtn to="enrollments">Enrollments &amp; status</NavBtn>
          <NavBtn to="reports">Reports</NavBtn>
          <NavBtn to="results">Results &amp; certificates</NavBtn>
          <NavBtn to="settings">Email settings</NavBtn>
          <NavBtn to="export">Export data</NavBtn>
        </div>
        <div className="main">
          <PortalFlash />
          <Routes>
            <Route index element={<Navigate to="courses" replace />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="export" element={<AdminExport />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
