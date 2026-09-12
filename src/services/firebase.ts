import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
 * Sign in with Google Popup with enhanced diagnostic handling
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Google Sign-In error:', error);
    const code = error?.code || '';
    
    if (code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please complete authentication to continue.');
    } else if (code === 'auth/popup-blocked') {
      throw new Error('Popup blocked by browser or iframe. Open app in a new tab or use Email & Password below.');
    } else if (code === 'auth/unauthorized-domain') {
      throw new Error(
        'Google Auth domain not authorized in Firebase Console yet. Please use Email & Password Sign Up / Sign In below.'
      );
    } else if (code === 'auth/operation-not-allowed') {
      throw new Error(
        'Google provider not enabled in Firebase project. Please use Email & Password Sign In / Sign Up below.'
      );
    } else if (code === 'auth/network-request-failed') {
      throw new Error('Network connection error. Please check your internet connection and try again.');
    } else {
      throw new Error(
        error?.message || 'Google sign-in is unavailable in this environment. Please sign in with Email & Password below.'
      );
    }
  }
};

/**
 * Sign in with Email and Password
 */
export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Email Sign-In error:', error);
    const code = error?.code || '';

    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please verify your credentials or sign up.');
    } else if (code === 'auth/invalid-email') {
      throw new Error('Please enter a valid corporate email address.');
    } else if (code === 'auth/too-many-requests') {
      throw new Error('Access temporarily locked due to multiple failed attempts. Please try again later.');
    } else if (code === 'auth/operation-not-allowed') {
      throw new Error('Email/Password provider is not yet enabled in Firebase Console. You can sign in using Demo mode.');
    } else {
      throw new Error(error?.message || 'Unable to sign in. Please verify your email and password.');
    }
  }
};

/**
 * Sign up with Email and Password
 */
export const signUpWithEmail = async (
  email: string,
  pass: string,
  displayName: string
): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = result.user;

    // Update profile display name
    if (displayName.trim()) {
      try {
        await updateProfile(user, { displayName: displayName.trim() });
      } catch (profileErr) {
        console.warn('Could not set displayName on user profile:', profileErr);
      }
    }

    return user;
  } catch (error: any) {
    console.error('Firebase Email Sign-Up error:', error);
    const code = error?.code || '';

    if (code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please switch to Sign In.');
    } else if (code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    } else if (code === 'auth/invalid-email') {
      throw new Error('Please enter a valid corporate email address.');
    } else if (code === 'auth/operation-not-allowed') {
      throw new Error('Email/Password sign-up is not yet enabled in Firebase Console. You can sign in using Demo mode.');
    } else {
      throw new Error(error?.message || 'Unable to create account. Please try again.');
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
