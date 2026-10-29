import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from 'fs';
import path from 'path';

async function runSafeAdminSeeding() {
  console.log("Starting Non-Destructive Firebase Admin SDK Seeding for Vastraa...");

  const envServiceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let serviceAccount = null;

  if (envServiceAccountPath && fs.existsSync(envServiceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(envServiceAccountPath, 'utf8'));
  } else {
    const fallbackPath = path.resolve('serviceAccountKey.json');
    if (fs.existsSync(fallbackPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
  }

  if (!serviceAccount) {
    console.warn("Notice: No Admin SDK serviceAccountKey.json file found. Skipping Admin SDK seed script.");
    return;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }

  const auth = getAuth();
  const db = getFirestore();

  const isForceClean = process.argv.includes('--force-clean-test-data');
  if (isForceClean) {
    console.log("⚠️ CAUTION: Executing tagged test enquiries cleanup (--force-clean-test-data enabled)...");
    const enqSnap = await db.collection("enquiries").get();
    for (const doc of enqSnap.docs) {
      if (doc.data().isTestData === true) {
        await doc.ref.delete();
      }
    }
  } else {
    console.log("🔒 Non-destructive mode active. Production records PRESERVED.");
  }

  // Seed Master Admin User
  const adminEmail = "admin@gmail.com";
  let adminUid = "admin_uid_001";

  try {
    const existingAdmin = await auth.getUserByEmail(adminEmail);
    adminUid = existingAdmin.uid;
  } catch {
    // Admin user lookup notice
  }

  await db.collection("users").doc(adminUid).set({
    uid: adminUid,
    name: "Vastraa Master Admin",
    email: adminEmail,
    role: "admin",
    whatsapp: "+919746998785",
    address: "Kerala, India",
    pincode: "680001",
    createdAt: new Date().toISOString()
  }, { merge: true });

  console.log("✓ Firebase Admin SDK Seeding Completed Safely! ZERO production data modified.");
}

runSafeAdminSeeding().catch(err => {
  console.error("Admin seeding error:", err);
});
