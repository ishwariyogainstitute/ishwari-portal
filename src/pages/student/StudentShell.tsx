import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { PortalFlash } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import StudentEnroll from './StudentEnroll';
import StudentEnrollments from './StudentEnrollments';
import StudentResults from './StudentResults';

function NavBtn({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => (isActive ? 'active' : '')}>
      {children}
    </NavLink>
  );
}

export default function StudentShell() {
  const { currentStudent } = usePortal();
  if (!currentStudent) return null;

  return (
    <>
      <TopBar showLogout />
      <div className="shell">
        <div className="nav">
          <div className="navlabel">
            {currentStudent.name.toUpperCase()}
            <br />
            <span style={{ opacity: 0.7 }}>{currentStudent.id}</span>
          </div>
          <NavBtn to="/portal/enroll">Enroll in a course</NavBtn>
          <NavBtn to="/portal/enrollments">My enrollments</NavBtn>
          <NavBtn to="/portal/results">Results &amp; certificates</NavBtn>
        </div>
        <div className="main">
          <PortalFlash />
          <Routes>
            <Route index element={<Navigate to="/portal/enroll" replace />} />
            <Route path="enroll" element={<StudentEnroll />} />
            <Route path="enrollments" element={<StudentEnrollments />} />
            <Route path="results" element={<StudentResults />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
