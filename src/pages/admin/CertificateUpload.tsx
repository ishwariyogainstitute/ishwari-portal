import { useState } from 'react';
import { usePortal } from '../../lib/PortalContext';
import { fmtDate } from '../../lib/utils';
import { buildCSV, downloadCSV, parseCSV, readFileAsText } from '../../lib/csv';
import { parseCertMappingRows, processCertificateUpload, deleteCertificate, type CertMappingRow, type CertUploadSummary } from '../../lib/actions';
import { studentById } from '../../lib/actions';

const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'];

export default function CertificateUpload({ courseId }: { courseId: string }) {
  const portal = usePortal();
  const { data } = portal;
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [pendingRows, setPendingRows] = useState<CertMappingRow[] | null>(null);
  const [filesNote, setFilesNote] = useState<string | null>(null);
  const [mappingNote, setMappingNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [summary, setSummary] = useState<CertUploadSummary | null>(null);

  const uploaded = data.certificates.filter((c) => c.courseId === courseId);
  const byEnrollment: Record<string, typeof uploaded> = {};
  uploaded.forEach((c) => {
    (byEnrollment[c.enrollmentId] = byEnrollment[c.enrollmentId] || []).push(c);
  });

  function downloadTemplate() {
    const roster = data.enrollments.filter((e) => e.courseId === courseId);
    const course = data.courses.find((x) => x.id === courseId);
    const header = ['RegistrationID', 'StudentName', 'CertificateType', 'Start Date', 'End date', 'Certificate - L1', 'Certificate - L2', 'Certificate - L3', 'Certificate - L4', 'Certificate -L5'];
    const rows: (string | number)[][] = [header];
    roster.forEach((e) => {
      const st = studentById(data.students, e.studentId);
      rows.push([e.id, st ? st.name : '', course ? course.category || course.name : '', course ? course.startDate : '', course ? course.endDate : '', '', '', '', '', '']);
    });
    downloadCSV(`certificates-${course ? course.name.replace(/[^a-z0-9]+/gi, '-') : courseId}.csv`, buildCSV(rows));
  }

  function onFilesSelected(evt: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(evt.target.files || []);
    const map: Record<string, File> = {};
    files.forEach((f) => (map[f.name] = f));
    setPendingFiles(map);
    setFilesNote(files.length ? `${files.length} file(s) ready: ${files.map((f) => f.name).join(', ')}` : null);
  }

  async function onMappingSelected(evt: React.ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files && evt.target.files[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const parsed = parseCertMappingRows(parseCSV(text));
    if (parsed.error) {
      setMappingNote({ ok: false, text: parsed.error });
      setPendingRows(null);
      return;
    }
    setPendingRows(parsed.rows!);
    setMappingNote({ ok: true, text: `Mapping loaded: ${parsed.rows!.length} certificate row(s) across ${new Set(parsed.rows!.map((r) => r.regId)).size} student(s). Click "Upload certificates" below.` });
  }

  async function upload() {
    if (!pendingRows || pendingRows.length === 0) {
      portal.flash('err', 'Upload a filled mapping CSV first.');
      return;
    }
    const result = await processCertificateUpload(portal, courseId, pendingRows, pendingFiles);
    setSummary(result);
    setPendingRows(null);
    setPendingFiles({});
  }

  return (
    <div className="panel" style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 16 }}>Upload certificates by level</h2>
      <div className="sub">
        A student can clear several levels within a course (e.g. L1, L2, L3), each with its own certificate. 1) Download the mapping
        template below. 2) For each level a student has cleared, put a Certificate Type label (e.g. "YCB - Level2") and the exact
        file name you'll select in step 3 under that level's column — <code>Certificate - L1</code> through{' '}
        <code>Certificate - L5</code>. A student can have several columns filled on one row, or several rows. 3) Select all the
        certificate files at once. 4) Upload the filled mapping CSV, then click Upload.
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <button className="btn secondary small" onClick={downloadTemplate}>Download mapping CSV</button>
      </div>
      <div className="field">
        <label>Select certificate files (PDF or image, select all at once)</label>
        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onFilesSelected} />
        {filesNote && <div className="msg ok">{filesNote}</div>}
      </div>
      <div className="field">
        <label>Upload filled mapping CSV</label>
        <input type="file" accept=".csv" onChange={onMappingSelected} />
        {mappingNote && <div className={`msg ${mappingNote.ok ? 'ok' : 'err'}`}>{mappingNote.text}</div>}
      </div>
      <button className="btn green" onClick={upload}>Upload certificates</button>
      {summary && (
        <div className={`msg ${summary.missingFiles.length || summary.badRows.length ? 'err' : 'ok'}`} style={{ marginTop: 12 }}>
          Uploaded {summary.uploaded} certificate(s).
          {summary.missingFiles.length ? ` No matching selected file for: ${summary.missingFiles.join(', ')}.` : ''}
          {summary.badRows.length ? ` Not matched to this course/roster: ${summary.badRows.join(', ')}.` : ''}
        </div>
      )}

      {uploaded.length === 0 ? (
        <div className="empty" style={{ marginTop: 14 }}>No certificates uploaded for this course yet.</div>
      ) : (
        <table style={{ marginTop: 14 }}>
          <tbody>
            <tr><th>Student</th><th>Reg. ID</th><th>Level</th><th>Certificate Type</th><th>File</th><th>Uploaded</th><th></th></tr>
            {Object.keys(byEnrollment).flatMap((enrollmentId) => {
              const en = data.enrollments.find((e) => e.id === enrollmentId);
              const st = en && studentById(data.students, en.studentId);
              return [...byEnrollment[enrollmentId]]
                .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))
                .map((c) => (
                  <tr key={c.id}>
                    <td>{st ? st.name : '—'}</td>
                    <td><span className="id-chip">{enrollmentId}</span></td>
                    <td><span className="badge ongoing">{c.level}</span></td>
                    <td>{c.certType}</td>
                    <td><a href={c.url} target="_blank" rel="noopener noreferrer">{c.fileName}</a></td>
                    <td>{fmtDate(c.uploadedAt.slice(0, 10))}</td>
                    <td>
                      <button
                        className="btn small secondary"
                        onClick={() => {
                          if (window.confirm('Remove this certificate? Students will no longer see it.')) deleteCertificate(portal, c.id);
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ));
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
