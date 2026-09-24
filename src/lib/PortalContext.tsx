import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection as fsCollection,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, db, FS_COLLECTION } from './firebase';
import type { PortalData, Student, FlashMessage } from '../types';
import { emptyPortalData } from '../types';

type Role = 'admin' | 'student' | null;

interface PortalContextValue {
  data: PortalData;
  loading: boolean;
  role: Role;
  currentStudent: Student | null;
  message: FlashMessage;
  flash: (type: 'ok' | 'err', text: string) => void;
  clearMessage: () => void;
  /** Replace one collection's array locally and persist it to Firestore. */
  setCollection: <K extends keyof PortalData>(key: K, value: PortalData[K]) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginStudent: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerStudent: (student: Omit<Student, 'id' | 'uid'>, password: string) => Promise<{ ok: boolean; error?: string; student?: Student }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const PortalContext = createContext<PortalContextValue | null>(null);

const DATA_KEYS = ['courses', 'students', 'enrollments', 'results', 'certificates', 'settings'] as const;

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortalData>(emptyPortalData);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState<FlashMessage>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const flashTimer = useRef<number | undefined>(undefined);

  const loadAll = useCallback(async () => {
    const next: PortalData = { ...emptyPortalData };
    for (const key of DATA_KEYS) {
      try {
        const snap = await getDoc(doc(fsCollection(db, FS_COLLECTION), key));
        if (snap.exists()) {
          const d = snap.data();
          if (d && d.items !== undefined) (next as any)[key] = d.items;
        }
      } catch (e) {
        console.error('Firestore load error for', key, e);
        flash('err', 'Could not connect to the database. Check your internet connection and reload.');
      }
    }
    setData(next);
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = useCallback((type: 'ok' | 'err', text: string) => {
    setMessage({ type, text });
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setMessage(null), 4000);
  }, []);

  const clearMessage = useCallback(() => setMessage(null), []);

  const setCollection = useCallback(
    async <K extends keyof PortalData>(key: K, value: PortalData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      try {
        await setDoc(doc(fsCollection(db, FS_COLLECTION), key as string), {
          items: value,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Firestore save error for', key, e);
        flash('err', 'Could not save to the database — check your internet connection and try again.');
      }
    },
    [flash]
  );

  // Initial data load
  useEffect(() => {
    (async () => {
      await loadAll();
      setLoading(false);
    })();
  }, [loadAll]);

  // Auth session restore (page refresh) — mirrors the original
  // auth.onAuthStateChanged handler.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setRole((prev) => (prev ? null : prev));
        setCurrentStudent(null);
        return;
      }
      try {
        const profileSnap = await getDoc(doc(db, 'users', user.uid));
        if (profileSnap.exists() && profileSnap.data().role === 'admin' && profileSnap.data().active !== false) {
          setRole('admin');
          return;
        }
        const current = dataRef.current;
        const student =
          current.students.find((s) => s.uid === user.uid) ||
          current.students.find((s) => s.email === (user.email || '').toLowerCase());
        if (student) {
          if (student.uid !== user.uid) {
            const updated = current.students.map((s) => (s.id === student.id ? { ...s, uid: user.uid } : s));
            await setCollection('students', updated);
          }
          setCurrentStudent(student);
          setRole('student');
        }
      } catch (e) {
        console.error('Auth session restore failed', e);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginAdmin = useCallback(
    async (email: string, password: string) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) return { ok: false, error: 'Enter your administrator email and password.' };
      try {
        const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = credential.user;
        const profile = await getDoc(doc(db, 'users', user.uid));
        if (!profile.exists() || profile.data().role !== 'admin' || profile.data().active === false) {
          await signOut(auth);
          return {
            ok: false,
            error:
              'This account is authenticated but is not authorised as an active administrator. Create users/' +
              user.uid +
              ' with role: admin in Firestore.',
          };
        }
        // Re-fetch now that we're authenticated, in case Firestore rules
        // restrict reads to signed-in users.
        await loadAll();
        setRole('admin');
        return { ok: true };
      } catch (e) {
        console.error('Admin authentication failed', e);
        return { ok: false, error: 'Invalid administrator email or password.' };
      }
    },
    [loadAll]
  );

  const loginStudent = useCallback(
    async (email: string, password: string) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) return { ok: false, error: 'Enter your email and password.' };
      try {
        const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = credential.user;
        const fresh = await loadAll();
        let student = fresh.students.find((s) => s.uid === user.uid);
        if (!student) student = fresh.students.find((s) => s.email === cleanEmail);
        if (!student) {
          await signOut(auth);
          return { ok: false, error: 'Your Firebase account is valid, but no student profile was found. Please contact the institute administrator.' };
        }
        if (student.uid !== user.uid) {
          const updated = fresh.students.map((s) => (s.id === student!.id ? { ...s, uid: user.uid } : s));
          await setCollection('students', updated);
          student = { ...student, uid: user.uid };
        }
        setCurrentStudent(student);
        setRole('student');
        return { ok: true };
      } catch (e) {
        console.error('Student authentication failed', e);
        return { ok: false, error: 'Invalid email or password. If you forgot your password, use the password-reset option below.' };
      }
    },
    [loadAll, setCollection]
  );

  const registerStudent = useCallback(
    async (partial: Omit<Student, 'id' | 'uid'>, password: string) => {
      const email = partial.email.trim().toLowerCase();
      if (dataRef.current.students.some((s) => s.email === email)) {
        return { ok: false, error: 'An account with this email already exists — try logging in instead.' };
      }
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = credential.user.uid;
        const student: Student = {
          ...partial,
          email,
          id: 'STU' + String(dataRef.current.students.length + 1).padStart(4, '0'),
          uid,
        };
        const updated = [...dataRef.current.students, student];
        await setCollection('students', updated);
        setCurrentStudent(student);
        setRole('student');
        return { ok: true, student };
      } catch (e: any) {
        console.error('Student registration failed', e);
        const msg =
          e && e.code === 'auth/email-already-in-use'
            ? 'An account with this email already exists — try logging in instead.'
            : e && e.code === 'auth/weak-password'
            ? 'Password is too weak. Use at least 6 characters.'
            : 'Registration could not be completed. Please try again.';
        return { ok: false, error: msg };
      }
    },
    [setCollection]
  );

  const resetPassword = useCallback(async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { ok: false, error: 'Enter your registered email first.' };
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { ok: true };
    } catch (e) {
      console.error('Password reset failed', e);
      return { ok: false, error: 'Unable to send reset email. Check the email address and Firebase Authentication settings.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout failed', e);
    }
    setRole(null);
    setCurrentStudent(null);
    setMessage(null);
  }, []);

  const value: PortalContextValue = {
    data,
    loading,
    role,
    currentStudent,
    message,
    flash,
    clearMessage,
    setCollection,
    loginAdmin,
    loginStudent,
    registerStudent,
    resetPassword,
    logout,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within a PortalProvider');
  return ctx;
}
