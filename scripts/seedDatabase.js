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

async function safeSeedFirestoreData() {
  const isForceClean = process.argv.includes('--force-clean-test-data');

  if (isForceClean) {
    console.log("⚠️ CAUTION: Executing test data cleanup (--force-clean-test-data enabled)...");
    try {
      const enqSnapshot = await getDocs(collection(fireDB, "enquiries"));
      for (const d of enqSnapshot.docs) {
        if (d.data().isTestData === true) {
          await deleteDoc(doc(fireDB, "enquiries", d.id));
          console.log(`Deleted tagged test enquiry: ${d.id}`);
        }
      }
    } catch (err) {
      console.warn("Cleanup test enquiries notice:", err.message);
    }
  } else {
    console.log("🔒 Non-destructive mode active. Production enquiries and customer records are PRESERVED.");
  }

  console.log("🌱 Seeding/updating Master Admin & Customer User Details in Firestore ('users' collection)...");

  const usersToSeed = [
    { email: "admin@gmail.com", name: "Vastraa Master Admin", role: "admin", whatsapp: "+919746998785", address: "Kerala, India", pincode: "680001", uid: "admin_uid_001" },
    { email: "test1@gmail.com", name: "Test Customer One", role: "customer", whatsapp: "9746998783", address: "Kerala, India", pincode: "680001", uid: "test_uid_001" },
    { email: "test2@gmail.com", name: "Test Customer Two", role: "customer", whatsapp: "9746998786", address: "Kerala, India", pincode: "680002", uid: "test_uid_002" },
    { email: "test3@gmail.com", name: "Test Customer Three", role: "customer", whatsapp: "9746998787", address: "Kerala, India", pincode: "680003", uid: "test_uid_003" },
    { email: "test4@gmail.com", name: "Test Customer Four", role: "customer", whatsapp: "9746998788", address: "Kerala, India", pincode: "680005", uid: "test_uid_004" },
    { email: "test5@gmail.com", name: "Test Customer Five", role: "customer", whatsapp: "9746998789", address: "Kerala, India", pincode: "680306", uid: "test_uid_005" }
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

  const configRef = doc(fireDB, "catalogue_config", "sync_status");
  await setDoc(configRef, {
    lastVerifiedAt: new Date().toISOString(),
    totalExtracted: 3252,
    status: "SEEDED_SUCCESS"
  }, { merge: true });
  console.log("✓ Seeded catalogue sync status.");

  console.log("✨ Safe non-destructive database seeding completed!");
}

safeSeedFirestoreData().catch(err => {
  console.error("Seeding error:", err);
});
