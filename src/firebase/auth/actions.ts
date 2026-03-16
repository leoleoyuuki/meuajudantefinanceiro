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

    const userRef = doc(firestore, "users", user.uid);
    const batch = writeBatch(firestore);
    const now = new Date().toISOString();
    const role = email === ADMIN_EMAIL ? 'admin' : 'user';

    const userProfileData = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: null,
        whatsapp: whatsapp,
        role: role,
        createdAt: now,
        subscriptionStatus: 'inactive',
        subscriptionExpiresAt: null,
        subscriptionStartedAt: null,
        subscriptionSourceCode: null,
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
