'use client';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, UserCredential } from "firebase/auth";
import { Firestore, writeBatch, doc, collection } from "firebase/firestore";
import { defaultCategories } from "@/lib/default-categories";

interface SignUpData {
    name: string;
    whatsapp: string;
    email: string;
    password: string;
}

interface SignInData {
    email: string;
    password: string;
}

const ADMIN_EMAIL = 'leo.yuuki@icloud.com';

export async function signUpWithEmail(auth: Auth, firestore: Firestore, { name, whatsapp, email, password }: SignUpData): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    // Firestore document creation is now handled by the onAuthStateChanged
    // listener in src/firebase/provider.tsx to consolidate new user setup
    // and prevent race conditions.
    
    return userCredential;
}

export async function signInWithEmail(auth: Auth, { email, password }: SignInData): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}
