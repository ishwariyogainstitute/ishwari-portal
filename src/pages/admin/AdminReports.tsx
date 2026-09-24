import { SectionLabel, Empty, StatusBadge } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import { courseStatus, parseDate } from '../../lib/utils';

export default function AdminReports() {
  const { data } = usePortal();

  const rows = data.courses
    .map((c) => {
      const enrs = data.enrollments.filter((e) => e.courseId === c.id);
      return {
        c,
        total: enrs.length,
        inReview: enrs.filter((e) => e.status === 'In Review').length,
        pending: enrs.filter((e) => e.status === 'Pending').length,
        active: enrs.filter((e) => e.status === 'Active').length,
      };
    })
    .sort((a, b) => b.total - a.total || parseDate(a.c.startDate).getTime() - parseDate(b.c.startDate).getTime());

  return (
    <>
      <SectionLabel>APPLICATIONS BY COURSE</SectionLabel>
      {rows.length === 0 ? (
        <Empty>No courses published yet.</Empty>
      ) : (
        <table>
          <tbody>
            <tr><th>Course</th><th>Course status</th><th>Total applied</th><th>In Review</th><th>Pending</th><th>Active</th></tr>
            {rows.map((r) => (
              <tr key={r.c.id}>
                <td><div className="serif" style={{ fontSize: 15 }}>{r.c.name}</div></td>
                <td><StatusBadge status={courseStatus(r.c)} /></td>
                <td>{r.total}</td>
                <td>{r.inReview}</td>
                <td>{r.pending}</td>
                <td>{r.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
