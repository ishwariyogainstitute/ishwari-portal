export type CourseStatus = 'upcoming' | 'ongoing' | 'completed';
export type EnrollmentStatus = 'In Review' | 'Pending' | 'Active';

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  fee: number;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
}

export interface Student {
  id: string;
  uid: string;
  name: string;
  dob: string;
  age: number | null;
  gender: string;
  occupation: string;
  mobile: string;
  email: string;
  address: string;
  education: string;
  priorYoga: 'yes' | 'no';
  priorYogaDetail: string;
  examLanguage: string;
  medical: 'yes' | 'no';
  medicalDetail: string;
  purpose: string;
  agreedAt: string;
  registeredAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  fee: number;
  status: EnrollmentStatus;
  statusUpdatedAt: string | null;
}

export interface Result {
  id: string;
  enrollmentId: string;
  score: string;
  grade: string;
  pass: boolean;
  certificateId: string;
  publishedAt: string;
}

export interface CertificateFile {
  id: string;
  enrollmentId: string;
  courseId: string;
  certType: string;
  level: string; // 'L1'..'L5' — which level this certificate is for
  fileName: string;
  url: string;
  uploadedAt: string;
}

export interface EmailSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface PortalData {
  courses: Course[];
  students: Student[];
  enrollments: Enrollment[];
  results: Result[];
  certificates: CertificateFile[];
  settings: EmailSettings;
}

export const emptyPortalData: PortalData = {
  courses: [],
  students: [],
  enrollments: [],
  results: [],
  certificates: [],
  settings: { serviceId: '', templateId: '', publicKey: '' },
};

export type FlashMessage = { type: 'ok' | 'err'; text: string } | null;
