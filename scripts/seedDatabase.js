import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

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
  console.log("🧹 Starting Firestore Database Cleanup...");

  // 1. Cleanup existing test enquiries
  try {
    const enqSnapshot = await getDocs(collection(fireDB, "enquiries"));
    for (const d of enqSnapshot.docs) {
      await deleteDoc(doc(fireDB, "enquiries", d.id));
      console.log(`Deleted old enquiry: ${d.id}`);
    }
  } catch (err) {
    console.warn("Cleanup enquiries notice:", err.message);
  }

  console.log("🌱 Re-seeding Firestore test users, admin, and collections with complete fields...");

  // 2. Seed Users with all relevant fields
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
    console.log(`Seeded user profile: ${u.email}`);
  }

  // 3. Seed Sample Multi-Item Bag Review Request (Enquiry with cartItems)
  const enquiryRef = collection(fireDB, "enquiries");
  await addDoc(enquiryRef, {
    sareeId: "MULTIPLE_BAG_ITEMS",
    sareeTitle: "Shopping Bag Review Request (3 items)",
    categoryName: "Multi-Item Bag Submission",
    imageUrl: "https://lh3.googleusercontent.com/pw/AP1GczO5uQ7JjyrEhAQYwqx_rnj_gHyjFNRYd7tskFvyG_Nzdnb4r6E20YcRSW3AxSY8YUNfesFS9A7kfJdIf8Bhpnx5fNOfFQ-4OTLId8_mmjQAD_Zxf-Na=w1024-h1024",
    cartItems: [
      { id: "gphoto_A_001", title: "Saree A-001", categoryName: "Kanchipuram Pure Wedding Silk Sarees", indicativePriceRange: "₹13,500–₹32,500", imageUrl: "https://lh3.googleusercontent.com/pw/AP1GczO5uQ7JjyrEhAQYwqx_rnj_gHyjFNRYd7tskFvyG_Nzdnb4r6E20YcRSW3AxSY8YUNfesFS9A7kfJdIf8Bhpnx5fNOfFQ-4OTLId8_mmjQAD_Zxf-Na=w1024-h1024" },
      { id: "gphoto_A_002", title: "Saree A-002", categoryName: "Kanchipuram Pure Wedding Silk Sarees", indicativePriceRange: "₹13,500–₹32,500", imageUrl: "https://lh3.googleusercontent.com/pw/AP1GczO5uQ7JjyrEhAQYwqx_rnj_gHyjFNRYd7tskFvyG_Nzdnb4r6E20YcRSW3AxSY8YUNfesFS9A7kfJdInFw?key=ZkMtODl1blppejBkd0ZzcF9VR2llMjlVR1k4ZUlB" },
      { id: "gphoto_A_003", title: "Saree A-003", categoryName: "Kanchipuram Pure Wedding Silk Sarees", indicativePriceRange: "₹13,500–₹32,500", imageUrl: "https://lh3.googleusercontent.com/pw/AP1GczO5uQ7JjyrEhAQYwqx_rnj_gHyjFNRYd7tskFvyG_Nzdnb4r6E20YcRSW3AxSY8YUNfesFS9A7kfJdInFw?key=ZkMtODl1blppejBkd0ZzcF9VR2llMjlVR1k4ZUlB" }
    ],
    customerName: "Test Customer One",
    phone: "9746998785",
    message: "Bag Ref: VAST-REQ-430698. Items: Saree A-001 | Saree A-002 | Saree A-003. Delivery Address: MG Road, Thrissur - Pincode: 680001",
    createdAt: new Date().toISOString(),
    status: "Pending"
  });
  console.log("Seeded sample multi-item bag review enquiry.");

  // 4. Seed Catalogue Config Sync Status
  const configRef = doc(fireDB, "catalogue_config", "sync_status");
  await setDoc(configRef, {
    lastVerifiedAt: new Date().toISOString(),
    totalExtracted: 3252,
    status: "SEEDED_SUCCESS"
  }, { merge: true });
  console.log("Seeded catalogue sync status.");

  console.log("Firestore database cleanup and re-seeding completed successfully!");
}

cleanAndSeedFirestoreData().catch(err => {
  console.error("Seeding error:", err);
});
