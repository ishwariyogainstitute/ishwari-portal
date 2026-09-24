import { SectionLabel, Empty, AdmissionBadge } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import { fmtDate, fmtMoney } from '../../lib/utils';
import { courseById } from '../../lib/actions';

export default function StudentEnrollments() {
  const { data, currentStudent } = usePortal();
  if (!currentStudent) return null;

  const mine = data.enrollments
    .filter((e) => e.studentId === currentStudent.id)
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));

  return (
    <>
      <SectionLabel>MY ENROLLMENTS ({mine.length})</SectionLabel>
      {mine.length === 0 ? (
        <Empty>You haven't enrolled in any course yet.</Empty>
      ) : (
        <>
          <table>
            <tbody>
              <tr><th>Registration ID</th><th>Course</th><th>Dates</th><th>Fee</th><th>Enrollment status</th></tr>
              {mine.map((e) => {
                const c = courseById(data.courses, e.courseId);
                return (
                  <tr key={e.id}>
                    <td><span className="id-chip">{e.id}</span></td>
                    <td>{c ? c.name : '—'}</td>
                    <td>{c ? `${fmtDate(c.startDate)} – ${fmtDate(c.endDate)}` : '—'}</td>
                    <td>{fmtMoney(e.fee)}</td>
                    <td><AdmissionBadge status={e.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
            The institute confirms your enrollment after checking payment — you'll get an email as soon as your status changes.
          </div>
        </>
      )}
    </>
  );
}
