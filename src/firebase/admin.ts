import "server-only";
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let app: admin.app.App;

async function initializeAdminApp() {
  if (!admin.apps.length) {
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    app = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } else {
    app = admin.app();
  }
  return app;
}

export async function getFirebaseAdmin() {
  const adminApp = await initializeAdminApp();
  return {
    auth: adminApp.auth(),
    db: adminApp.firestore(),
  };
}
