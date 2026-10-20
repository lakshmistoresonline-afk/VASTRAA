import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBw94fJQrF9UUY_fnXTXnStJe3fDdpo9w4",
  authDomain: "virtual-fashion-studio-5d8c9.firebaseapp.com",
  projectId: "virtual-fashion-studio-5d8c9",
  storageBucket: "virtual-fashion-studio-5d8c9.firebasestorage.app",
  messagingSenderId: "597120741257",
  appId: "1:597120741257:web:396ba099b80ed3d6367b58"
};

const app = initializeApp(firebaseConfig);
const fireDB = getFirestore(app);

async function seedFirestoreData() {
  console.log("Seeding Firestore test users, admin, and collections...");

  // 1. Seed Users
  const usersToSeed = [
    { email: "admin@gmail.com", name: "Vastraa Master Admin", role: "admin", uid: "admin_uid_001" },
    { email: "test1@gmail.com", name: "Test Customer One", role: "customer", uid: "test_uid_001" },
    { email: "test2@gmail.com", name: "Test Customer Two", role: "customer", uid: "test_uid_002" },
    { email: "test3@gmail.com", name: "Test Customer Three", role: "customer", uid: "test_uid_003" },
    { email: "test4@gmail.com", name: "Test Customer Four", role: "customer", uid: "test_uid_004" },
    { email: "test5@gmail.com", name: "Test Customer Five", role: "customer", uid: "test_uid_005" }
  ];

  for (const u of usersToSeed) {
    const userDocRef = doc(fireDB, "users", u.uid);
    await setDoc(userDocRef, {
      uid: u.uid,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log(`Seeded user: ${u.email}`);
  }

  // 2. Seed Sample Enquiries
  const enquiryRef = collection(fireDB, "enquiries");
  await addDoc(enquiryRef, {
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
  console.log("Seeded sample enquiry.");

  // 3. Seed Catalogue Config Sync Status
  const configRef = doc(fireDB, "catalogue_config", "sync_status");
  await setDoc(configRef, {
    lastVerifiedAt: new Date().toISOString(),
    totalExtracted: 3252,
    status: "SEEDED_SUCCESS"
  }, { merge: true });
  console.log("Seeded catalogue sync status.");

  console.log("Firestore seeding completed successfully!");
}

seedFirestoreData().catch(err => {
  console.error("Seeding error:", err);
});
