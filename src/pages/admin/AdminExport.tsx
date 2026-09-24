import { usePortal } from '../../lib/PortalContext';
import { exportToExcel } from '../../lib/notifications';

export default function AdminExport() {
  const { data } = usePortal();

  return (
    <div className="panel accent">
      <h2>Export data to Excel</h2>
      <div className="sub">
        This portal's live data is stored securely behind the scenes. Use this button any time to download a full, current
        snapshot as an Excel workbook — one sheet each for Registrations, Enrollments &amp; Status, and Results — to keep as
        your records backup or import elsewhere.
      </div>
      <button className="btn gold" onClick={() => exportToExcel(data.courses, data.students, data.enrollments, data.results)}>
        Download Excel workbook
      </button>
      <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-soft)' }}>
        {data.students.length} registrations · {data.enrollments.length} enrollments · {data.results.length} results ·{' '}
        {data.certificates.length} certificate file(s) as of now.
      </div>
    </div>
  );
}
