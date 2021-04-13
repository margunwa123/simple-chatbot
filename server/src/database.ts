import admin from "firebase-admin";
import serviceAccountKey from "../serviceAccountKey.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      privateKey: serviceAccountKey.private_key,
      projectId: serviceAccountKey.project_id,
      clientEmail: serviceAccountKey.client_email,
    }),
  });
}
const db = admin.firestore();

export { db };
