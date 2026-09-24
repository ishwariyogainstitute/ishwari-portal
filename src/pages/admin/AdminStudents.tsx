import { useState } from 'react';
import { SectionLabel, Empty, Modal } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import { fmtDate } from '../../lib/utils';
import { confirmResetStudentPassword } from '../../lib/actions';
import type { Student } from '../../types';

export default function AdminStudents() {
  const portal = usePortal();
  const { data } = portal;
  const [viewing, setViewing] = useState<Student | null>(null);
  const [resetting, setResetting] = useState<Student | null>(null);

  const sorted = [...data.students].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

  async function doReset(s: Student) {
    const err = await confirmResetStudentPassword(portal, s.email);
    if (err) portal.flash('err', err);
    else portal.flash('ok', `Password reset email sent to ${s.email}.`);
    setResetting(null);
    setViewing(null);
  }

  return (
    <>
      <SectionLabel>REGISTERED STUDENTS ({data.students.length})</SectionLabel>
      {sorted.length === 0 ? (
        <Empty>No students have registered yet.</Empty>
      ) : (
        <table>
          <tbody>
            <tr><th>Student ID</th><th>Name</th><th>Mobile</th><th>Email</th><th>Registered</th><th></th></tr>
            {sorted.map((s) => (
              <tr key={s.id}>
                <td><span className="id-chip">{s.id}</span></td>
                <td>{s.name}</td>
                <td>{s.mobile || '—'}</td>
                <td>{s.email}</td>
                <td>{fmtDate(s.registeredAt.slice(0, 10))}</td>
                <td><button className="btn small secondary" onClick={() => setViewing(s)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <h2 style={{ fontSize: 19 }}>{viewing.name}</h2>
          <div className="sub" style={{ marginTop: 2 }}>{viewing.id} · Full registration details</div>
          <div className="profile-grid">
            <div><label>Date of birth</label><div>{fmtDate(viewing.dob)}</div></div>
            <div><label>Age</label><div>{viewing.age ?? '—'}</div></div>
            <div><label>Gender</label><div>{viewing.gender || '—'}</div></div>
            <div><label>Occupation</label><div>{viewing.occupation || '—'}</div></div>
            <div><label>Mobile</label><div>{viewing.mobile || '—'}</div></div>
            <div><label>Email</label><div>{viewing.email}</div></div>
            <div style={{ gridColumn: '1/-1' }}><label>Address</label><div>{viewing.address || '—'}</div></div>
            <div><label>Education</label><div>{viewing.education || '—'}</div></div>
            <div><label>Preferred exam language</label><div>{viewing.examLanguage || '—'}</div></div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Prior yoga knowledge / certification</label>
              <div>{viewing.priorYoga === 'yes' ? `Yes — ${viewing.priorYogaDetail || ''}` : 'No'}</div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Medical history / condition</label>
              <div>{viewing.medical === 'yes' ? `Yes — ${viewing.medicalDetail || ''}` : 'No'}</div>
            </div>
            <div style={{ gridColumn: '1/-1' }}><label>Statement of purpose</label><div>{viewing.purpose || '—'}</div></div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Registered</label>
              <div>{fmtDate(viewing.registeredAt.slice(0, 10))} · Terms agreed: {viewing.agreedAt ? 'Yes' : 'No'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn secondary small" onClick={() => setResetting(viewing)}>Reset password</button>
            <button className="btn secondary" onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {resetting && (
        <Modal onClose={() => setResetting(null)} maxWidth={420}>
          <h2 style={{ fontSize: 18 }}>Reset password — {resetting.name}</h2>
          <div className="sub">
            This sends a Firebase password-reset email to <strong>{resetting.email}</strong>. There's no way to set a password for a
            student directly from the admin panel — Firebase requires the student to confirm the change themselves via email.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn green" onClick={() => doReset(resetting)}>Send reset email</button>
            <button className="btn secondary" onClick={() => setResetting(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}
