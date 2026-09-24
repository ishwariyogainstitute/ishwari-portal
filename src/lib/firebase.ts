import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Same Firebase project as the original single-file portal, so existing
// student/enrollment/result/certificate data keeps working unchanged.
// This key is safe to ship in client code — Firestore/Storage security
// rules (not this key) control who can read or write.
const firebaseConfig = {
  apiKey: 'AIzaSyDV_wUPGzzGLZWjPpyfD-sX7MzwbrBTQUM',
  authDomain: 'ishwari-institute-portal.firebaseapp.com',
  projectId: 'ishwari-institute-portal',
  storageBucket: 'ishwari-institute-portal.firebasestorage.app',
  messagingSenderId: '304557970294',
  appId: '1:304557970294:web:0e66cc8ff211e033dea057',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Same collection used by the original portal: one document per data key,
// each document holding the whole array under `items`. Kept as-is on
// purpose so this migration doesn't require a data migration.
export const FS_COLLECTION = 'ishwari_institute';
