import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { nextId, parseDate, fmtMoney } from './utils';
import { sendEmail } from './notifications';
import type { Course, Enrollment, Result, CertificateFile, PortalData } from '../types';
import type { usePortal } from './PortalContext';

type Portal = ReturnType<typeof usePortal>;

export function courseById(courses: Course[], id: string | null | undefined) {
  return courses.find((c) => c.id === id);
}
export function studentById(students: PortalData['students'], id: string | null | undefined) {
  return students.find((s) => s.id === id);
}

export async function addCourse(
  portal: Portal,
  input: { name: string; description: string; startDate: string; endDate: string; category: string; fee: number }
): Promise<string | null> {
  if (!input.name || !input.startDate || !input.endDate) return 'Course name, start date and end date are required.';
  if (parseDate(input.endDate) < parseDate(input.startDate)) return "End date can't be before the start date.";
  if (input.fee < 0) return "Fee can't be negative.";
  const course: Course = { id: nextId('CRS', portal.data.courses), ...input };
  await portal.setCollection('courses', [...portal.data.courses, course]);
  portal.flash('ok', `"${input.name}" has been published.`);
  return null;
}

export async function saveCourseEdit(
  portal: Portal,
  courseId: string,
  input: { name: string; description: string; startDate: string; endDate: string; category: string; fee: number }
): Promise<string | null> {
  if (!input.name || !input.startDate || !input.endDate) return 'Course name, start date and end date are required.';
  if (parseDate(input.endDate) < parseDate(input.startDate)) return "End date can't be before the start date.";
  if (input.fee < 0) return "Fee can't be negative.";
  const updated = portal.data.courses.map((c) => (c.id === courseId ? { ...c, ...input } : c));
  await portal.setCollection('courses', updated);
  portal.flash('ok', `"${input.name}" has been updated.`);
  return null;
}

export async function setEnrollmentStatus(portal: Portal, enrollmentId: string, newStatus: Enrollment['status']) {
  const e = portal.data.enrollments.find((x) => x.id === enrollmentId);
  if (!e) return;
  const updated = portal.data.enrollments.map((x) =>
    x.id === enrollmentId ? { ...x, status: newStatus, statusUpdatedAt: new Date().toISOString() } : x
  );
  await portal.setCollection('enrollments', updated);
  portal.flash('ok', `Status updated to ${newStatus}.`);
  const st = studentById(portal.data.students, e.studentId);
  const c = courseById(portal.data.courses, e.courseId);
  if (!st || !c) return;
  if (newStatus === 'Active') {
    sendEmail(
      portal.data.settings,
      st.email,
      st.name,
      'Your enrollment is now Active',
      `Good news, ${st.name} — your enrollment for ${c.name} (Registration ID ${e.id}) is now Active. We look forward to having you in the course.`
    ).catch(() => {});
  } else if (newStatus === 'Pending') {
    sendEmail(
      portal.data.settings,
      st.email,
      st.name,
      'Payment confirmation pending',
      `Hi ${st.name}, we've received your registration for ${c.name} (Registration ID ${e.id}), but payment confirmation is still pending. Please complete your payment so we can activate your enrollment.`
    ).catch(() => {});
  }
}

export function upsertResultLocal(results: Result[], enrollmentId: string, score: string, grade: string, pass: boolean): Result[] {
  const existing = results.find((r) => r.enrollmentId === enrollmentId);
  if (existing) {
    return results.map((r) =>
      r.enrollmentId === enrollmentId ? { ...r, score, grade, pass, publishedAt: new Date().toISOString() } : r
    );
  }
  const result: Result = {
    id: nextId('RES', results),
    enrollmentId,
    score,
    grade,
    pass,
    certificateId: 'CERT-' + enrollmentId,
    publishedAt: new Date().toISOString(),
  };
  return [...results, result];
}

export async function publishResult(portal: Portal, enrollmentId: string, score: string, grade: string, pass: boolean): Promise<string | null> {
  if (score === '') return 'Enter a score before publishing.';
  const updated = upsertResultLocal(portal.data.results, enrollmentId, score, grade, pass);
  await portal.setCollection('results', updated);
  portal.flash('ok', 'Result published. The student can now view it.');
  const e = portal.data.enrollments.find((x) => x.id === enrollmentId);
  const st = e && studentById(portal.data.students, e.studentId);
  const c = e && courseById(portal.data.courses, e.courseId);
  if (st && c) {
    sendEmail(
      portal.data.settings,
      st.email,
      st.name,
      'Your result is published',
      `Your result for ${c.name}: Score ${score}${grade ? ', Grade ' + grade : ''} — ${pass ? 'Pass' : 'Fail'}.`
    ).catch(() => {});
  }
  return null;
}

export interface BulkResultsOutcome {
  updated: number;
  notFound: string[];
  touched: string[];
  error?: string;
}

export function processResultsCSVRows(
  rows: string[][],
  courseId: string,
  enrollments: Enrollment[],
  existingResults: Result[]
): { outcome: BulkResultsOutcome; nextResults: Result[] } {
  if (rows.length === 0) return { outcome: { updated: 0, notFound: [], touched: [], error: 'The file appears to be empty.' }, nextResults: existingResults };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idIdx = header.indexOf('registrationid');
  const scoreIdx = header.indexOf('score');
  const gradeIdx = header.indexOf('grade');
  const resultIdx = header.indexOf('result');
  if (idIdx === -1 || scoreIdx === -1) {
    return { outcome: { updated: 0, notFound: [], touched: [], error: 'CSV must include RegistrationID and Score columns.' }, nextResults: existingResults };
  }
  let results = existingResults;
  let updated = 0;
  const notFound: string[] = [];
  const touched: string[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[idIdx]) continue;
    const regId = r[idIdx].trim();
    const enrollment = enrollments.find((e) => e.id === regId && e.courseId === courseId);
    if (!enrollment) {
      notFound.push(regId);
      continue;
    }
    const score = (r[scoreIdx] || '').trim();
    if (score === '') continue;
    const grade = gradeIdx > -1 ? (r[gradeIdx] || '').trim() : '';
    const passVal = resultIdx > -1 ? (r[resultIdx] || '').trim().toLowerCase() : '';
    const pass = passVal ? passVal.startsWith('p') : Number(score) >= 40;
    results = upsertResultLocal(results, enrollment.id, score, grade, pass);
    touched.push(enrollment.id);
    updated++;
  }
  return { outcome: { updated, notFound, touched }, nextResults: results };
}

export interface CertMappingRow { regId: string; certType: string; level: string; fileName: string }

const LEVEL_COL_RE = /^certificatel([1-5])$/;

/** Normalizes a CSV header like "Certificate - L1" or "Certificate -L5" into
 *  "certificatel1" / "certificatel5" for matching, ignoring spacing/hyphen
 *  variations between columns. */
function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s-]+/g, '');
}

/** Parses the certificate-mapping CSV. Each row can represent one or more
 *  level-certificates for a student (whichever "Certificate - Lx" columns
 *  are filled in on that row) — e.g. a student who cleared L1 and L2 of the
 *  same track in one sitting can have both filled on a single row, or use
 *  separate rows per level. certType carries the row's label (e.g.
 *  "YCB - Level2") through to the stored certificate for display. */
export function parseCertMappingRows(rows: string[][]): { rows?: CertMappingRow[]; error?: string } {
  if (rows.length === 0) return { error: 'The file appears to be empty.' };
  const header = rows[0].map(normalizeHeader);
  const idIdx = header.indexOf('registrationid');
  const typeIdx = header.indexOf('certificatetype');
  const levelCols: { idx: number; level: string }[] = [];
  header.forEach((h, idx) => {
    const m = h.match(LEVEL_COL_RE);
    if (m) levelCols.push({ idx, level: 'L' + m[1] });
  });
  if (idIdx === -1) return { error: 'CSV must include a RegistrationID column.' };
  if (levelCols.length === 0) return { error: 'CSV must include at least one "Certificate - L1".."L5" column.' };
  const out: CertMappingRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[idIdx]) continue;
    const certType = typeIdx > -1 ? (r[typeIdx] || '').trim() : '';
    for (const { idx, level } of levelCols) {
      const fileName = (r[idx] || '').trim();
      if (!fileName) continue;
      out.push({ regId: r[idIdx].trim(), certType, level, fileName });
    }
  }
  return { rows: out };
}

export interface CertUploadSummary { uploaded: number; missingFiles: string[]; badRows: string[] }

export async function processCertificateUpload(
  portal: Portal,
  courseId: string,
  rows: CertMappingRow[],
  files: Record<string, File>
): Promise<CertUploadSummary> {
  let uploaded = 0;
  const missingFiles: string[] = [];
  const badRows: string[] = [];
  let certificates = portal.data.certificates;
  for (const row of rows) {
    const enrollment = portal.data.enrollments.find((e) => e.id === row.regId && e.courseId === courseId);
    if (!enrollment) {
      badRows.push(row.regId);
      continue;
    }
    const file = files[row.fileName];
    if (!file) {
      missingFiles.push(`${row.fileName} (${row.regId} ${row.level})`);
      continue;
    }
    try {
      const path = `certificates/${courseId}/${enrollment.id}/${row.level}/${Date.now()}-${row.fileName}`;
      const ref = storageRef(storage, path);
      const snap = await uploadBytes(ref, file);
      const url = await getDownloadURL(snap.ref);
      // Replace any existing certificate for this enrollment+level rather than
      // stacking duplicates when a level is re-uploaded.
      certificates = certificates.filter((c) => !(c.enrollmentId === enrollment.id && c.level === row.level));
      const cert: CertificateFile = {
        id: nextId('CERTF', certificates),
        enrollmentId: enrollment.id,
        courseId,
        certType: row.certType || row.level,
        level: row.level,
        fileName: row.fileName,
        url,
        uploadedAt: new Date().toISOString(),
      };
      certificates = [...certificates, cert];
      uploaded++;
    } catch (err) {
      console.error('Certificate upload failed', err);
      badRows.push(`${row.regId} ${row.level} (${row.fileName})`);
    }
  }
  await portal.setCollection('certificates', certificates);
  if (uploaded > 0) portal.flash('ok', `Uploaded ${uploaded} certificate(s).`);
  return { uploaded, missingFiles, badRows };
}

export async function deleteCertificate(portal: Portal, certId: string) {
  const updated = portal.data.certificates.filter((c) => c.id !== certId);
  await portal.setCollection('certificates', updated);
  portal.flash('ok', 'Certificate removed.');
}

export async function confirmResetStudentPassword(portal: Portal, email: string): Promise<string | null> {
  const outcome = await portal.resetPassword(email);
  if (outcome.ok) return null;
  return (
    outcome.error ||
    `No Firebase login exists for ${email} yet. This student likely registered before Firebase login was enabled — add them under Authentication → Users in the Firebase console first (any temporary password), then they can log in and reset it themselves.`
  );
}

export async function saveEmailSettings(portal: Portal, settings: PortalData['settings']) {
  await portal.setCollection('settings', settings);
  portal.flash('ok', 'Email settings saved.');
}

export async function enrollInCourse(portal: Portal, courseId: string) {
  const course = courseById(portal.data.courses, courseId);
  const s = portal.currentStudent;
  if (!course || !s) return;
  const fee = Number(course.fee) || 0;
  const enrollment: Enrollment = {
    id: nextId('REG', portal.data.enrollments),
    studentId: s.id,
    courseId,
    enrolledAt: new Date().toISOString(),
    fee,
    status: 'In Review',
    statusUpdatedAt: null,
  };
  await portal.setCollection('enrollments', [...portal.data.enrollments, enrollment]);
  portal.flash('ok', `You're enrolled. Registration ID: ${enrollment.id}. Your status is In Review — we'll confirm it shortly.`);
  sendEmail(
    portal.data.settings,
    s.email,
    s.name,
    'Course enrollment received',
    `You're enrolled in ${course.name}. Your Registration ID is ${enrollment.id}.${fee > 0 ? ` Fee: ${fmtMoney(fee)}.` : ''} Your enrollment status is currently In Review — we'll update you once it's confirmed.`
  ).catch(() => {});
  return enrollment;
}
