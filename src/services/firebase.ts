import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(config);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in with Google Popup
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Google Sign-In error:', error);
    // Filter and normalize user-facing error messages
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please complete authentication to continue.');
    } else if (error?.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked by browser. Please allow popups for this site and try again.');
    } else if (error?.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('Unable to sign in. Please try again.');
    }
  }
};

/**
 * Sign out of Firebase Auth
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out error:', error);
    throw new Error('Unable to sign out. Please try again.');
  }
};

export { onAuthStateChanged };
export type { User };
