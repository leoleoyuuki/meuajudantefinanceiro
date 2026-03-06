'use client';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, UserCredential } from "firebase/auth";
import { Firestore, writeBatch, doc, collection } from "firebase/firestore";
import { defaultCategories } from "@/lib/default-categories";

interface SignUpData {
    name: string;
    phone: string;
    email: string;
    password: string;
}

interface SignInData {
    email: string;
    password: string;
}

export async function signUpWithEmail(auth: Auth, firestore: Firestore, { name, phone, email, password }: SignUpData): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile displayName
    await updateProfile(user, { displayName: name });

    // Create user document and default categories in Firestore within a batch
    const userRef = doc(firestore, "users", user.uid);
    const batch = writeBatch(firestore);
    const now = new Date().toISOString();

    const userProfileData = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: null,
        phone: phone,
        createdAt: now,
    };
    batch.set(userRef, userProfileData);

    const categoriesRef = collection(firestore, 'users', user.uid, 'categories');
    defaultCategories.forEach((category) => {
        const newCategoryRef = doc(categoriesRef);
        batch.set(newCategoryRef, {
            ...category,
            id: newCategoryRef.id,
            userId: user.uid,
            createdAt: now,
            updatedAt: now,
        });
    });

    await batch.commit();

    return userCredential;
}

export async function signInWithEmail(auth: Auth, { email, password }: SignInData): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}
