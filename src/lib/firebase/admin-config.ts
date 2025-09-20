import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const appName = 'firebase-admin-app';

function getFirebaseAdminApp(): App {
  const anApp = getApps().find(a => a.name === appName);
  if (anApp) {
    return anApp;
  }
  return initializeApp({
    // credential is not needed when running in the cloud
    storageBucket: process.env.GCLOUD_PROJECT + '.appspot.com',
  }, appName);
}

const adminApp = getFirebaseAdminApp();

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage, getFirebaseAdminApp };
