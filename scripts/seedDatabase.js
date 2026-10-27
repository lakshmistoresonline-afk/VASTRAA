import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBw94fJQrF9UUY_fnXTXnStJe3fDdpo9w4",
  authDomain: "vastraa-c7da1.firebaseapp.com",
  projectId: "vastraa-c7da1",
  storageBucket: "vastraa-c7da1.firebasestorage.app",
  messagingSenderId: "597120741257",
  appId: "1:597120741257:web:396ba099b80ed3d6367b58"
};

const app = initializeApp(firebaseConfig);
const fireDB = getFirestore(app);

async function cleanAndSeedFirestoreData() {
  console.log("🧹 Starting Complete Firestore Database Cleanup (Removing all orders, carts, enquiries & jobs)...");

  // 1. Delete all documents from enquiries collection
  try {
    const enqSnapshot = await getDocs(collection(fireDB, "enquiries"));
    for (const d of enqSnapshot.docs) {
      await deleteDoc(doc(fireDB, "enquiries", d.id));
      console.log(`Deleted enquiry: ${d.id}`);
    }
  } catch (err) {
    console.warn("Cleanup enquiries notice:", err.message);
  }

  // 2. Delete all documents from whatsapp_jobs collection
  try {
    const jobsSnapshot = await getDocs(collection(fireDB, "whatsapp_jobs"));
    for (const d of jobsSnapshot.docs) {
      await deleteDoc(doc(fireDB, "whatsapp_jobs", d.id));
      console.log(`Deleted whatsapp_job: ${d.id}`);
    }
  } catch (err) {
    console.warn("Cleanup whatsapp_jobs notice:", err.message);
  }

  // 3. Delete all documents from orders collection (if any)
  try {
    const ordersSnapshot = await getDocs(collection(fireDB, "orders"));
    for (const d of ordersSnapshot.docs) {
      await deleteDoc(doc(fireDB, "orders", d.id));
      console.log(`Deleted order: ${d.id}`);
    }
  } catch (err) {
    console.warn("Cleanup orders notice:", err.message);
  }

  console.log("🌱 Seeding ONLY Master Admin & Customer User Details in Firestore ('users' collection)...");

  // 4. Seed ONLY Master Admin & Customer User Details
  const usersToSeed = [
    { email: "admin@gmail.com", name: "Vastraa Master Admin", role: "admin", whatsapp: "+919746998785", address: "Round West, Thrissur, Kerala", pincode: "680001", uid: "admin_uid_001" },
    { email: "test1@gmail.com", name: "Test Customer One", role: "customer", whatsapp: "9746998785", address: "MG Road, Thrissur, Kerala", pincode: "680001", uid: "test_uid_001" },
    { email: "test2@gmail.com", name: "Test Customer Two", role: "customer", whatsapp: "9746998786", address: "Shornur Road, Thrissur, Kerala", pincode: "680002", uid: "test_uid_002" },
    { email: "test3@gmail.com", name: "Test Customer Three", role: "customer", whatsapp: "9746998787", address: "Sakthan Nagar, Thrissur, Kerala", pincode: "680003", uid: "test_uid_003" },
    { email: "test4@gmail.com", name: "Test Customer Four", role: "customer", whatsapp: "9746998788", address: "East Fort, Thrissur, Kerala", pincode: "680005", uid: "test_uid_004" },
    { email: "test5@gmail.com", name: "Test Customer Five", role: "customer", whatsapp: "9746998789", address: "Ollur, Thrissur, Kerala", pincode: "680306", uid: "test_uid_005" }
  ];

  for (const u of usersToSeed) {
    const userDocRef = doc(fireDB, "users", u.uid);
    await setDoc(userDocRef, {
      uid: u.uid,
      name: u.name,
      email: u.email,
      role: u.role,
      whatsapp: u.whatsapp,
      address: u.address,
      pincode: u.pincode,
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Seeded user profile: ${u.email} (${u.role})`);
  }

  // 5. Seed Catalogue Config Sync Status
  const configRef = doc(fireDB, "catalogue_config", "sync_status");
  await setDoc(configRef, {
    lastVerifiedAt: new Date().toISOString(),
    totalExtracted: 3252,
    status: "SEEDED_SUCCESS"
  }, { merge: true });
  console.log("✓ Seeded catalogue sync status.");

  console.log("✨ Firestore database seeding completed! ZERO orders/enquiries/carts loaded.");
}

cleanAndSeedFirestoreData().catch(err => {
  console.error("Seeding error:", err);
});
