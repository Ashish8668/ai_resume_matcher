/**
 * Firestore connection configuration
 */
const admin = require('firebase-admin');
const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = require('./env');

let firestore = null;

const connectDB = async () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: FIREBASE_PROJECT_ID,
      });
    }

    firestore = admin.firestore();
    firestore.settings({ ignoreUndefinedProperties: true });
    console.log(`Firestore connected: ${FIREBASE_PROJECT_ID}`);
  } catch (error) {
    console.error('Firestore connection error:', error.message);
    process.exit(1);
  }
};

const getFirestore = () => {
  if (!firestore) {
    throw new Error('Firestore is not initialized. Call connectDB() first.');
  }
  return firestore;
};

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

module.exports = connectDB;
module.exports.getFirestore = getFirestore;
module.exports.serverTimestamp = serverTimestamp;
