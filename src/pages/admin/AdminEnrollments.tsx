import { SectionLabel, Empty, AdmissionBadge } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import { fmtDate, fmtMoney } from '../../lib/utils';
import { courseById, studentById, setEnrollmentStatus } from '../../lib/actions';

export default function AdminEnrollments() {
  const portal = usePortal();
  const { data } = portal;
  const sorted = [...data.enrollments].sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));

  return (
    <>
      <SectionLabel>ALL ENROLLMENTS ({data.enrollments.length})</SectionLabel>
      {sorted.length === 0 ? (
        <Empty>No enrollments yet.</Empty>
      ) : (
        <table>
          <tbody>
            <tr><th>Registration ID</th><th>Student</th><th>Course</th><th>Fee</th><th>Status</th><th>Enrolled on</th><th></th></tr>
            {sorted.map((e) => {
              const st = studentById(data.students, e.studentId);
              const c = courseById(data.courses, e.courseId);
              return (
                <tr key={e.id}>
                  <td><span className="id-chip">{e.id}</span></td>
                  <td>{st ? st.name : '—'}</td>
                  <td>{c ? c.name : '—'}</td>
                  <td>{fmtMoney(e.fee)}</td>
                  <td><AdmissionBadge status={e.status} /></td>
                  <td>{fmtDate(e.enrolledAt.slice(0, 10))}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {e.status !== 'Active' && (
                      <button className="btn small green" onClick={() => setEnrollmentStatus(portal, e.id, 'Active')}>
                        Mark Active
                      </button>
                    )}{' '}
                    {e.status !== 'Pending' && (
                      <button className="btn small secondary" onClick={() => setEnrollmentStatus(portal, e.id, 'Pending')}>
                        Mark Pending
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
        Check payment (bank transfer / UPI / cash) outside the portal, then set the status here — the student is emailed automatically
        when you do.
      </div>
    </>
  );
}
