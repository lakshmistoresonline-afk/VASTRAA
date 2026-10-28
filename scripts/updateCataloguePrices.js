import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function updateAllCataloguePrices() {
  console.log("📈 Updating Firestore Saree Prices (+5% for Cat A, B, C, F & +3% for Cat D, E, G, H, I)...");

  try {
    const pSnap = await getDocs(collection(fireDB, "products"));
    let count5 = 0;
    let count3 = 0;

    for (const docSnap of pSnap.docs) {
      const data = docSnap.data();
      const code = (data.catalogueCode || '').toUpperCase();
      const currentPrice = Number(data.price) || Number(data.minPrice) || 0;

      if (currentPrice > 0) {
        let newPrice = currentPrice;
        if (['A', 'B', 'C', 'F'].includes(code)) {
          newPrice = Math.round((currentPrice * 1.05) / 50) * 50; // +5%
          count5++;
        } else {
          newPrice = Math.round((currentPrice * 1.03) / 50) * 50; // +3%
          count3++;
        }

        await updateDoc(doc(fireDB, "products", docSnap.id), {
          price: newPrice,
          updatedAt: new Date().toISOString()
        });
      }
    }

    console.log(`✨ Price update complete! Updated ${count5} sarees in Cat A, B, C, F (+5%) and ${count3} sarees in Cat D, E, G, H, I (+3%).`);
  } catch (err) {
    console.error("Price update error:", err);
  }
}

updateAllCataloguePrices();
