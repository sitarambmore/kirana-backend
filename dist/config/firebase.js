"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("./env");
// You typically download a serviceAccountKey.json from Firebase Console.
// For the sake of this tutorial, we are using the FIREBASE_SERVER_KEY strategy or mocking it.
// Note: To use this in production, you must set `GOOGLE_APPLICATION_CREDENTIALS` 
// in your environment, or pass a full service account object to `admin.initializeApp`.
try {
    if (env_1.config.firebase.serverKey) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(JSON.parse(env_1.config.firebase.serverKey)),
        });
        console.log('Firebase Admin initialized successfully');
    }
    else {
        console.warn('Firebase Admin not initialized: Missing server key in env');
    }
}
catch (error) {
    console.error('Firebase Admin initialization error', error);
}
exports.default = firebase_admin_1.default;
