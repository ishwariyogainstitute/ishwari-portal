import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../../lib/PortalContext';
import { courseStatus, fmtDate, fmtMoney, parseDate } from '../../lib/utils';
import { enrollInCourse } from '../../lib/actions';

export default function StudentEnroll() {
  const portal = usePortal();
  const navigate = useNavigate();
  const { data, currentStudent } = portal;
  if (!currentStudent) return null;

  const myCourseIds = new Set(data.enrollments.filter((e) => e.studentId === currentStudent.id).map((e) => e.courseId));
  const available = data.courses
    .filter((c) => courseStatus(c) === 'upcoming' && !myCourseIds.has(c.id))
    .sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());

  const [selected, setSelected] = useState(available[0]?.id || '');

  async function submit() {
    if (!selected) return;
    await enrollInCourse(portal, selected);
    navigate('/portal/enrollments');
  }

  return (
    <div className="panel accent">
      <h2>Enroll in a course</h2>
      <div className="sub">Only courses that haven't started yet are shown here.</div>
      {available.length === 0 ? (
        <div className="empty" style={{ border: 'none', padding: '10px 0' }}>
          No upcoming courses available to enroll in right now — check back soon.
        </div>
      ) : (
        <>
          <div className="field">
            <label>Choose a course</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — starts {fmtDate(c.startDate)} — {fmtMoney(c.fee)}
                </option>
              ))}
            </select>
          </div>
          <button className="btn green" onClick={submit}>Enroll</button>
        </>
      )}
    </div>
  );
}
