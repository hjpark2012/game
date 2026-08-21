import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDzY8JgbPo6YrtE_8JHR0KcKsE7bULPzqY',
  authDomain: 'hjpark-web.firebaseapp.com',
  projectId: 'hjpark-web',
  storageBucket: 'hjpark-web.firebasestorage.app',
  messagingSenderId: '333775172949',
  appId: '1:333775172949:web:01d0ca27e904e96197abdc',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

setPersistence(auth, browserLocalPersistence).catch(() => {});

export function observeUser(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function loadCloudProgress(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveCloudProgress(uid, progress) {
  return setDoc(doc(db, 'users', uid), {
    ...progress,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
