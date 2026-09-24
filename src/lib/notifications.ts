import type { EmailSettings, Course, Student, Enrollment, Result } from '../types';

const NOTIFY_FROM_EMAIL = 'breathingpointstudio@gmail.com';

let emailjsInited = false;

export function emailReady(settings: EmailSettings): boolean {
  return !!(settings && settings.serviceId && settings.templateId && settings.publicKey && (window as any).emailjs);
}

/** Sends via EmailJS's browser SDK, loaded from index.html as a plain
 *  <script> tag (same approach as the original single-file portal — no
 *  server needed, works fine from a static GitHub Pages deploy). */
export async function sendEmail(
  settings: EmailSettings,
  toEmail: string,
  toName: string,
  subject: string,
  message: string
): Promise<boolean> {
  if (!emailReady(settings)) return false;
  try {
    const emailjs = (window as any).emailjs;
    if (!emailjsInited) {
      emailjs.init({ publicKey: settings.publicKey });
      emailjsInited = true;
    }
    await emailjs.send(settings.serviceId, settings.templateId, {
      to_email: toEmail,
      to_name: toName,
      subject,
      message,
      from_email: NOTIFY_FROM_EMAIL,
    });
    return true;
  } catch (e) {
    console.error('email send failed', e);
    return false;
  }
}

export async function exportToExcel(
  courses: Course[],
  students: Student[],
  enrollments: Enrollment[],
  results: Result[]
) {
  const XLSX = await import('xlsx');
  const courseById = (id: string) => courses.find((c) => c.id === id);
  const studentById = (id: string) => students.find((s) => s.id === id);

  const studentRows = students.map((s) => ({
    'Student ID': s.id,
    'Full Name': s.name,
    'Date of Birth': s.dob,
    Age: s.age,
    Gender: s.gender,
    Occupation: s.occupation,
    Mobile: s.mobile,
    Email: s.email,
    Address: s.address,
    Education: s.education,
    'Prior Yoga Knowledge': s.priorYoga === 'yes' ? 'Yes' : 'No',
    'Prior Yoga Detail': s.priorYogaDetail || '',
    'Preferred Exam Language': s.examLanguage,
    'Medical Condition': s.medical === 'yes' ? 'Yes' : 'No',
    'Medical Detail': s.medicalDetail || '',
    'Statement of Purpose': s.purpose,
    'Terms Agreed': s.agreedAt ? 'Yes' : 'No',
    'Registered On': s.registeredAt,
  }));

  const enrollRows = enrollments.map((e) => {
    const st = studentById(e.studentId);
    const c = courseById(e.courseId);
    return {
      'Registration ID': e.id,
      'Student ID': e.studentId,
      'Student Name': st ? st.name : '',
      Course: c ? c.name : '',
      Fee: e.fee,
      'Enrollment Status': e.status,
      'Status Updated': e.statusUpdatedAt || '',
      'Enrolled On': e.enrolledAt,
    };
  });

  const resultRows = results.map((r) => {
    const e = enrollments.find((x) => x.id === r.enrollmentId);
    const st = e && studentById(e.studentId);
    const c = e && courseById(e.courseId);
    return {
      'Registration ID': r.enrollmentId,
      'Student Name': st ? st.name : '',
      Course: c ? c.name : '',
      Score: r.score,
      Grade: r.grade,
      Result: r.pass ? 'Pass' : 'Fail',
      'Certificate ID': r.certificateId,
      'Published On': r.publishedAt,
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentRows), 'Registrations');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(enrollRows), 'Enrollments');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resultRows), 'Results');
  XLSX.writeFile(wb, 'ishwari-institute-data-' + new Date().toISOString().slice(0, 10) + '.xlsx');
}
