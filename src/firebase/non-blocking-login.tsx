'use client';
import {
  Auth, // Import Auth type for type hinting
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // We are now using signInWithPopup.
  // We don't need to await it, as onAuthStateChanged will handle the result.
  signInWithPopup(authInstance, provider)
    .catch((error) => {
      // This can happen if the user closes the popup.
      // It's good to log it, but we don't need to show it to the user.
      console.error("Sign-in popup error:", error.message);
    });
}
