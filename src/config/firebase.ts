import admin from 'firebase-admin';
import { config } from './env';

// You typically download a serviceAccountKey.json from Firebase Console.
// For the sake of this tutorial, we are using the FIREBASE_SERVER_KEY strategy or mocking it.

// Note: To use this in production, you must set `GOOGLE_APPLICATION_CREDENTIALS` 
// in your environment, or pass a full service account object to `admin.initializeApp`.

try {
    if (config.firebase.serverKey) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(config.firebase.serverKey)),
        });
        console.log('Firebase Admin initialized successfully');
    } else {
        console.warn('Firebase Admin not initialized: Missing server key in env');
    }
} catch (error) {
    console.error('Firebase Admin initialization error', error);
}

export default admin;
