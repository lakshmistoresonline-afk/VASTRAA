import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from 'fs';

const serviceAccount = JSON.parse(
  fs.readFileSync('C:/Users/Acer/Downloads/virtual-fashion-studio-5d8c9-firebase-adminsdk-fbsvc-fca21c1e13.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function runAdminSeeding() {
  console.log("Starting Firebase Admin SDK Seeding for Vastraa...");

  // 1. Seed Admin User
  const adminEmail = "admin@gmail.com";
  const adminPassword = "Admin@123";
  let adminUid = "";

  try {
    const existingAdmin = await auth.getUserByEmail(adminEmail);
    adminUid = existingAdmin.uid;
    await auth.updateUser(adminUid, { password: adminPassword, emailVerified: true });
    console.log(`Updated admin user: ${adminEmail}`);
  } catch (_e) {
    const newAdmin = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: "Vastraa Master Admin",
      emailVerified: true
    });
    adminUid = newAdmin.uid;
    console.log(`Created admin user: ${adminEmail} (UID: ${adminUid})`);
  }

  await db.collection("users").doc(adminUid).set({
    uid: adminUid,
    name: "Vastraa Master Admin",
    email: adminEmail,
    role: "admin",
    createdAt: new Date().toISOString()
  }, { merge: true });

  // 2. Seed 5 Test Users
  for (let i = 1; i <= 5; i++) {
    const testEmail = `test${i}@gmail.com`;
    const testPassword = "Test@123";
    let testUid = "";

    try {
      const existingUser = await auth.getUserByEmail(testEmail);
      testUid = existingUser.uid;
      await auth.updateUser(testUid, { password: testPassword, emailVerified: true });
      console.log(`Updated test user: ${testEmail}`);
    } catch (_e) {
      const newUser = await auth.createUser({
        email: testEmail,
        password: testPassword,
        displayName: `Test Customer ${i}`,
        emailVerified: true
      });
      testUid = newUser.uid;
      console.log(`Created test user: ${testEmail} (UID: ${testUid})`);
    }

    await db.collection("users").doc(testUid).set({
      uid: testUid,
      name: `Test Customer ${i}`,
      email: testEmail,
      role: "customer",
      createdAt: new Date().toISOString()
    }, { merge: true });
  }

  // 3. Seed Sample Enquiries
  await db.collection("enquiries").add({
    sareeId: "gphoto_A_001",
    sareeTitle: "Kanchipuram Pure Wedding Silk Saree - Item 1",
    categoryName: "Kanchipuram Pure Wedding Silk Sarees",
    imageUrl: "https://lh3.googleusercontent.com/pw/AP1GczO5uQ7JjyrEhAQYwqx_rnj_gHyjFNRYd7tskFvyG_Nzdnb4r6E20YcRSW3AxSY8YUNfesFS9A7kfJdIf8Bhpnx5fNOfFQ-4OTLId8_mmjQAD_Zxf-Na=w1024-h1024",
    customerName: "Test Customer One",
    phone: "9746998785",
    message: "Please share individual price and availability for wedding ceremony.",
    createdAt: new Date().toISOString(),
    status: "Pending"
  });
  console.log("Seeded sample customer enquiry to Firestore.");

  // 4. Seed Catalogue Config Sync Status
  await db.collection("catalogue_config").doc("sync_status").set({
    lastVerifiedAt: new Date().toISOString(),
    totalExtracted: 3252,
    status: "SEEDED_SUCCESS"
  }, { merge: true });
  console.log("Seeded catalogue sync status to Firestore.");

  console.log("Firebase Admin SDK Seeding Completed Successfully!");
}

runAdminSeeding().catch(err => {
  console.error("Admin seeding error:", err);
});
