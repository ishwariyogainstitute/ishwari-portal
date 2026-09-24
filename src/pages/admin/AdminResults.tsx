import { useState } from 'react';
import { Empty } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import { courseStatus } from '../../lib/utils';
import { buildCSV, downloadCSV, parseCSV, readFileAsText } from '../../lib/csv';
import { publishResult, processResultsCSVRows, studentById, type BulkResultsOutcome } from '../../lib/actions';
import { sendEmail } from '../../lib/notifications';
import CertificateUpload from './CertificateUpload';

const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'];

export default function AdminResults() {
  const portal = usePortal();
  const { data } = portal;
  const eligible = data.courses.filter((c) => courseStatus(c) !== 'upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bulkSummary, setBulkSummary] = useState<{ updated: number; notFound: string[] } | null>(null);
  const [rowInputs, setRowInputs] = useState<Record<string, { score: string; grade: string; pass: 'pass' | 'fail' }>>({});

  const activeId = selectedId || (eligible[0] && eligible[0].id) || null;
  const roster = activeId ? data.enrollments.filter((e) => e.courseId === activeId) : [];

  function inputFor(enrollmentId: string) {
    if (rowInputs[enrollmentId]) return rowInputs[enrollmentId];
    const existing = data.results.find((r) => r.enrollmentId === enrollmentId);
    return { score: existing ? existing.score : '', grade: existing ? existing.grade : '', pass: existing ? (existing.pass ? 'pass' as const : 'fail' as const) : 'pass' as const };
  }

  function setInput(enrollmentId: string, patch: Partial<{ score: string; grade: string; pass: 'pass' | 'fail' }>) {
    setRowInputs((prev) => ({ ...prev, [enrollmentId]: { ...inputFor(enrollmentId), ...patch } }));
  }

  async function doPublish(enrollmentId: string) {
    const input = inputFor(enrollmentId);
    const err = await publishResult(portal, enrollmentId, input.score, input.grade, input.pass === 'pass');
    if (err) portal.flash('err', err);
  }

  function downloadRoster() {
    if (!activeId) return;
    const course = data.courses.find((x) => x.id === activeId);
    const header = ['RegistrationID', 'StudentName', 'Score', 'Course', 'Start Date', 'End Date', 'Grade', 'Result'];
    const rows: (string | number)[][] = [header];
    roster.forEach((e) => {
      const st = studentById(data.students, e.studentId);
      const r = data.results.find((x) => x.enrollmentId === e.id);
      rows.push([
        e.id,
        st ? st.name : '',
        r ? r.score : '',
        course ? course.name : '',
        course ? course.startDate : '',
        course ? course.endDate : '',
        r ? r.grade : '',
        r ? (r.pass ? 'Pass' : 'Fail') : '',
      ]);
    });
    downloadCSV(`roster-${course ? course.name.replace(/[^a-z0-9]+/gi, '-') : activeId}.csv`, buildCSV(rows));
  }

  async function onBulkFile(evt: React.ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files && evt.target.files[0];
    if (!file || !activeId) return;
    const text = await readFileAsText(file);
    const { outcome, nextResults }: { outcome: BulkResultsOutcome; nextResults: typeof data.results } = processResultsCSVRows(
      parseCSV(text),
      activeId,
      data.enrollments,
      data.results
    );
    if (outcome.error) {
      portal.flash('err', outcome.error);
      return;
    }
    await portal.setCollection('results', nextResults);
    setBulkSummary({ updated: outcome.updated, notFound: outcome.notFound });
    // Email each touched student, mirroring the original bulk-upload behaviour.
    outcome.touched.forEach((enrollmentId) => {
      const en = data.enrollments.find((x) => x.id === enrollmentId);
      const r = nextResults.find((x) => x.enrollmentId === enrollmentId);
      const st = en && studentById(data.students, en.studentId);
      const c = en && data.courses.find((x) => x.id === en.courseId);
      if (st && c && r) {
        sendEmail(
          data.settings,
          st.email,
          st.name,
          'Your result is published',
          `Your result for ${c.name}: Score ${r.score}${r.grade ? ', Grade ' + r.grade : ''} — ${r.pass ? 'Pass' : 'Fail'}.`
        ).catch(() => {});
      }
    });
  }

  return (
    <>
      <div className="panel accent">
        <h2>Update results</h2>
        <div className="sub">Only courses that have started can have results recorded.</div>
        <div className="field">
          <label>Course</label>
          <select
            value={activeId || ''}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setBulkSummary(null);
            }}
          >
            {eligible.length === 0 ? (
              <option value="">No started courses yet</option>
            ) : (
              eligible.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {!activeId ? (
        <Empty>Select a course above once it has started to record results.</Empty>
      ) : (
        <>
          {roster.length > 0 && (
            <div className="panel" style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 16 }}>Results &amp; certificates — all students</h2>
              <div className="sub">A read-only view of every enrolled student's result and certificate status across levels for this course.</div>
              <table>
                <tbody>
                  <tr>
                    <th>Student</th><th>Reg. ID</th><th>Score</th><th>Grade</th><th>Result</th>
                    {LEVELS.map((lvl) => <th key={lvl}>{lvl}</th>)}
                  </tr>
                  {roster.map((e) => {
                    const st = studentById(data.students, e.studentId);
                    const r = data.results.find((x) => x.enrollmentId === e.id);
                    const certsByLevel: Record<string, (typeof data.certificates)[number] | undefined> = {};
                    data.certificates.filter((c) => c.enrollmentId === e.id).forEach((c) => (certsByLevel[c.level] = c));
                    return (
                      <tr key={e.id}>
                        <td>{st ? st.name : '—'}</td>
                        <td><span className="id-chip">{e.id}</span></td>
                        <td>{r ? r.score : '—'}</td>
                        <td>{r ? r.grade || '—' : '—'}</td>
                        <td>{r ? (r.pass ? <span className="badge ongoing">Pass</span> : <span className="badge completed">Fail</span>) : '—'}</td>
                        {LEVELS.map((lvl) => {
                          const c = certsByLevel[lvl];
                          return (
                            <td key={lvl}>
                              {c ? (
                                <a href={c.url} target="_blank" rel="noopener noreferrer" title={c.certType}>
                                  ✓
                                </a>
                              ) : (
                                <span style={{ color: 'var(--ink-soft)' }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="panel" style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 16 }}>Bulk update via CSV</h2>
            <div className="sub">Download the roster, fill in Score / Grade / Result offline, then upload it back. Matches rows by Registration ID.</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn secondary small" onClick={downloadRoster}>Download roster CSV</button>
              <label className="btn secondary small file-btn">
                Upload results CSV
                <input type="file" accept=".csv" onChange={onBulkFile} />
              </label>
            </div>
            {bulkSummary && (
              <div className={`msg ${bulkSummary.notFound.length ? 'err' : 'ok'}`} style={{ marginTop: 12 }}>
                Updated {bulkSummary.updated} result(s).
                {bulkSummary.notFound.length ? ` Not matched to this course: ${bulkSummary.notFound.join(', ')}` : ''}
              </div>
            )}
          </div>

          {roster.length === 0 ? (
            <Empty>No students enrolled in this course yet.</Empty>
          ) : (
            <table>
              <tbody>
                <tr><th>Student</th><th>Reg. ID</th><th>Score</th><th>Grade</th><th>Result</th><th></th></tr>
                {roster.map((e) => {
                  const st = studentById(data.students, e.studentId);
                  const existing = data.results.find((r) => r.enrollmentId === e.id);
                  const input = inputFor(e.id);
                  return (
                    <tr key={e.id}>
                      <td>{st ? st.name : '—'}</td>
                      <td><span className="id-chip">{e.id}</span></td>
                      <td>
                        <input
                          style={{ width: 70 }}
                          type="number"
                          min={0}
                          max={100}
                          value={input.score}
                          onChange={(ev) => setInput(e.id, { score: ev.target.value })}
                        />
                      </td>
                      <td>
                        <input style={{ width: 60 }} placeholder="A" value={input.grade} onChange={(ev) => setInput(e.id, { grade: ev.target.value })} />
                      </td>
                      <td>
                        <select style={{ width: 100 }} value={input.pass} onChange={(ev) => setInput(e.id, { pass: ev.target.value as 'pass' | 'fail' })}>
                          <option value="pass">Pass</option>
                          <option value="fail">Fail</option>
                        </select>
                      </td>
                      <td>
                        <button className={`btn small ${existing ? 'secondary' : 'green'}`} onClick={() => doPublish(e.id)}>
                          {existing ? 'Update' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <CertificateUpload courseId={activeId} />
        </>
      )}
    </>
  );
}
