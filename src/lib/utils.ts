import type { Course, CourseStatus } from '../types';

export function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseDate(s: string): Date {
  return new Date(s + 'T00:00:00');
}

export function fmtDate(s: string | null | undefined): string {
  if (!s) return '—';
  return parseDate(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtMoney(n: number | string | null | undefined): string {
  const num = Number(n) || 0;
  return num > 0 ? '₹' + num.toLocaleString('en-IN') : 'Free';
}

export function calcAge(dobStr: string): number | null {
  if (!dobStr) return null;
  const dob = parseDate(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function courseStatus(course: Course): CourseStatus {
  const t = todayStart();
  const start = parseDate(course.startDate);
  const end = parseDate(course.endDate);
  if (start > t) return 'upcoming';
  if (end < t) return 'completed';
  return 'ongoing';
}

export function nextId(prefix: string, list: { id: string }[]): string {
  return prefix + String(list.length + 1).padStart(4, '0');
}

/** Simple sequential ID generator kept identical to the original app.
 *  Note: like the original, this assumes ids aren't assigned concurrently
 *  by two admins at once — fine for this portal's usage pattern. */
