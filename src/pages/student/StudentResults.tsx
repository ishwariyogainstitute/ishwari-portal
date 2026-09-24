import { SectionLabel, Empty, Modal } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import { fmtDate } from '../../lib/utils';
import { courseById } from '../../lib/actions';
import { useState } from 'react';
import ishwariLogo from '../../assets/ishwari-logo.png';
import { BP_LOGO_SRC } from '../../components/TopBar';
import type { Enrollment, Result } from '../../types';

export default function StudentResults() {
  const { data, currentStudent } = usePortal();
  const [viewing, setViewing] = useState<{ e: Enrollment; r: Result } | null>(null);
  if (!currentStudent) return null;

  const mine = data.enrollments.filter((e) => e.studentId === currentStudent.id);
  const withResults = mine
    .map((e) => ({ e, r: data.results.find((r) => r.enrollmentId === e.id) }))
    .filter((x): x is { e: Enrollment; r: Result } => !!x.r);
  const myCertFiles = data.certificates.filter((c) => mine.some((e) => e.id === c.enrollmentId));

  return (
    <>
      <SectionLabel>RESULTS &amp; CERTIFICATES</SectionLabel>
      {withResults.length === 0 ? (
        <Empty>No results have been published for you yet.</Empty>
      ) : (
        <table>
          <tbody>
            <tr><th>Course</th><th>Score</th><th>Grade</th><th>Result</th><th></th></tr>
            {withResults.map(({ e, r }) => {
              const c = courseById(data.courses, e.courseId);
              return (
                <tr key={e.id}>
                  <td>{c ? c.name : '—'}</td>
                  <td>{r.score}</td>
                  <td>{r.grade || '—'}</td>
                  <td>{r.pass ? <span className="badge ongoing">Pass</span> : <span className="badge completed">Fail</span>}</td>
                  <td>
                    {r.pass && (
                      <button className="btn small gold" onClick={() => setViewing({ e, r })}>
                        View certificate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="section-label" style={{ marginTop: 22 }}>
        <span>MY CERTIFICATE DOWNLOADS</span>
        <span className="rule" />
      </div>
      {myCertFiles.length === 0 ? (
        <Empty>No certificates have been uploaded for you yet.</Empty>
      ) : (
        <table>
          <tbody>
            <tr><th>Course</th><th>Level</th><th>Certificate Type</th><th>Issued</th><th></th></tr>
            {myCertFiles
              .sort((a, b) => a.level.localeCompare(b.level))
              .map((c) => {
              const co = courseById(data.courses, c.courseId);
              return (
                <tr key={c.id}>
                  <td>{co ? co.name : '—'}</td>
                  <td><span className="badge ongoing">{c.level}</span></td>
                  <td>{c.certType}</td>
                  <td>{fmtDate(c.uploadedAt.slice(0, 10))}</td>
                  <td>
                    <a className="btn small gold" href={c.url} target="_blank" rel="noopener noreferrer" download>
                      Download
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {viewing && (
        <Modal onClose={() => setViewing(null)} maxWidth={640}>
          <div id="print-area" className="certificate">
            <div className="certificate-inner">
              <img src={ishwariLogo} alt="ISHWARI" />
              <div className="cert-eyebrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
                <span>under</span>
                <img src={BP_LOGO_SRC} alt="Breathing Point" style={{ height: 16, width: 'auto' }} />
              </div>
              <div className="cert-eyebrow">ISHWARI — THE INSTITUTE FOR CONSCIOUS LIVING · CERTIFICATE OF COMPLETION</div>
              <div className="cert-rule" />
              <div className="cert-name">{currentStudent.name}</div>
              <div className="cert-course">
                has successfully completed
                <br />
                <b>{courseById(data.courses, viewing.e.courseId)?.name || ''}</b>
              </div>
              <div className="cert-rule" />
              <div className="cert-meta">
                Grade: {viewing.r.grade || '—'} &nbsp;·&nbsp; Score: {viewing.r.score} &nbsp;·&nbsp; Certificate ID: {viewing.r.certificateId}
                <br />
                Issued {fmtDate(viewing.r.publishedAt.slice(0, 10))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
            <button className="btn green" onClick={() => window.print()}>Print / save as PDF</button>
            <button className="btn secondary" onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}
    </>
  );
}
