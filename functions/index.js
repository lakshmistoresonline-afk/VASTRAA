import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// Master Catalogues A through I Album Configuration
const ALBUM_CONFIGS = [
  {
    code: "A",
    catalogueId: "kanchipuram-pure-wedding-silk",
    categoryName: "Kanchipuram Pure Wedding Silk Sarees",
    indicativePriceRange: "₹13,500–₹32,500",
    albums: [
      "https://photos.google.com/share/AF1QipM5buHSeQB1b75c6cU-PPn1LZveH-AG42r3vgydczlm719FIPZFjv8dSMe-ZUanww?key=RF9SUzQ3ODVSNVNVcjJtV0k3X1V1cFo3b1V0bmpR",
      "https://photos.google.com/share/AF1QipOUZyYAexal5fGBenQyi5diXX3W0Q3HpRKWWNgn93Uih-Y3qX1KaMPk7dEn5MiFDw?key=dzUtZVM2Zk5KVWhiVU9fN2x4WGhGZXhCQjcyVktn"
    ]
  },
  {
    code: "B",
    catalogueId: "kanchipuram-pure-fancy-silk",
    categoryName: "Kanchipuram Pure Fancy Silk Sarees",
    indicativePriceRange: "₹12,500–₹18,500",
    albums: [
      "https://photos.google.com/share/AF1QipPpwz18816TyQUvaLH6NgO-w0GTkyguKUZgZ5HFbaDt1P8qIxHJS_qviVzw3-QsaA?key=ZDBRMS1pdTUzYlZEbnZVcno2a18td1VFVEpJTHZn",
      "https://photos.google.com/share/AF1QipN4GWZm3N0lV3OgSTHYOQ-Sn7FNoDxgERKxixJJDCcno-QeXvL9eOIBHhZticqiJA?key=TXdpN2NRdlBmTEZjMmpBdW1TOGNSR2Jua1FGdlR3"
    ]
  },
  {
    code: "C",
    catalogueId: "kanchipuram-pure-soft-silk",
    categoryName: "Kanchipuram Pure Soft Silk Sarees",
    indicativePriceRange: "₹7,500–₹13,000",
    albums: [
      "https://photos.google.com/share/AF1QipPxV-MCf5356GxsAEtqby1kEdXSx2Yh_vihtiovSWjMAMugeJ5vXYU8GlIDktr_Eg?key=Y1Z2YTNaVTQ2TzJEb2p5ZmhSQl9PQ3RrOEY4elVR"
    ]
  },
  {
    code: "D",
    catalogueId: "semi-silk-sarees",
    categoryName: "Semi Silk Sarees",
    indicativePriceRange: "₹4,500–₹6,000",
    albums: [
      "https://photos.google.com/share/AF1QipOU0_QV4PhyU1j8g1RenSePPwoVSp_hu0beFdrM8t1nSWGAr-tS_325RxNMPB90EA?key=WVlrNFhtVXVGMTBFd0I3TWt1TG1xT3A1b21XVkJ3"
    ]
  },
  {
    code: "E",
    catalogueId: "semi-fancy-silk-sarees",
    categoryName: "Semi Fancy Silk Sarees",
    indicativePriceRange: "₹2,500–₹4,000",
    albums: [
      "https://photos.google.com/share/AF1QipPpaTrA8zA5d7F5dSfg4tclarHYZEE-B7V_LfZXjqM64zmfpEDSJA3_Kjetk0U7cw?key=bDlHcWhmS0dyWjJNRFV1TWdMbnNHc3JBMkYxNkhn"
    ]
  },
  {
    code: "F",
    catalogueId: "semi-kanchipuram-art-silk",
    categoryName: "Semi Kanchipuram Art Silk Sarees",
    indicativePriceRange: "₹3,500–₹6,000",
    albums: [
      "https://photos.google.com/share/AF1QipNzEH9t3GatRzJk9nQS4VTM78LipiFDN40W62tXfOuoJKVmLSnY8lgZsVeMlc41OA?key=Z1JIUUVLR0RFOURhWjB1THcxX2gtV1MyOUdJRElR"
    ]
  },
  {
    code: "G",
    catalogueId: "butta-art-silk-sarees",
    categoryName: "Butta Art Silk Sarees",
    indicativePriceRange: "₹2,000–₹3,500",
    albums: [
      "https://photos.google.com/share/AF1QipNzudmR-0rGGDlLb5eXy4gaxT5EO3FzmPSZAwwo-4Pu0njqKMt8lBkqiVUhkulZuA?key=dzhCRHgwaHI4S1FtUUZNd2FQcHRwZ0R2V2N6RFln"
    ]
  },
  {
    code: "H",
    catalogueId: "semi-art-silk-sarees",
    categoryName: "Semi Art Silk Sarees",
    indicativePriceRange: "₹1,500–₹3,000",
    albums: [
      "https://photos.google.com/share/AF1QipPGf18s1b4V83e1XUT9Wj6h_2CE7r1HfgCceqCKQTD2GTgvbo_xhOXS5CNiDmiOLg?key=ZkMtODl1blppejBkd0ZzcF9VR2llMjlVR1k4ZUlB"
    ]
  },
  {
    code: "I",
    catalogueId: "arts-silk-sarees",
    categoryName: "Arts Silk Sarees",
    indicativePriceRange: "₹1,500–₹3,000",
    albums: [
      "https://photos.google.com/share/AF1QipM3AE5rmOtboDdT8_mGkU5luAceaRlZUzZsDmG0JulL0-FWD7JoppsWMuKYpuXP4g?key=TlgzUHM0RkF5YlBlMzBZeTM5Rm5HbDlWdDZXa1J3"
    ]
  }
];

/**
 * Server-side extraction of Google Photos shared album image URLs (Bypasses CORS completely)
 */
async function extractGooglePhotosFromAlbum(albumUrl) {
  try {
    const res = await fetch(albumUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      redirect: "follow"
    });

    if (!res.ok) {
      console.error(`Failed to fetch album ${albumUrl}: HTTP ${res.status}`);
      return [];
    }

    const html = await res.text();
    const regex = /https:\/\/lh3\.googleusercontent\.com\/(pw|drive-viewer)\/[a-zA-Z0-9_=-]+/g;
    const matches = html.match(regex);

    if (!matches || matches.length === 0) return [];

    const uniqueUrls = [...new Set(matches)];
    return uniqueUrls.map((rawUrl, index) => {
      const cleanUrl = rawUrl.split("=")[0];
      return {
        id: `gphoto_${albumUrl.slice(-8)}_${index + 1}`,
        imageUrl: `${cleanUrl}=w1024-h1024`,
        rawUrl: cleanUrl
      };
    });
  } catch (err) {
    console.error(`Error in extractGooglePhotosFromAlbum for ${albumUrl}:`, err.message);
    return [];
  }
}

/**
 * Perform complete inventory sync and update Firestore
 */
async function executeInventorySync() {
  const syncTimestamp = new Date().toISOString();
  let totalExtracted = 0;
  const syncResults = [];

  for (const catalogue of ALBUM_CONFIGS) {
    for (const albumUrl of catalogue.albums) {
      const photos = await extractGooglePhotosFromAlbum(albumUrl);
      totalExtracted += photos.length;

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const docRef = db.collection("products").doc(photo.id);

        await docRef.set({
          id: photo.id,
          title: `${catalogue.categoryName} - Item ${i + 1}`,
          imageUrl: photo.imageUrl,
          albumUrl: albumUrl,
          catalogueCode: catalogue.code,
          catalogueId: catalogue.catalogueId,
          categoryName: catalogue.categoryName,
          indicativePriceRange: catalogue.indicativePriceRange,
          price: null, // Price on enquiry
          stockStatus: "CONFIRMED_AVAILABLE",
          lastVerifiedAt: syncTimestamp,
          updatedAt: syncTimestamp
        }, { merge: true });
      }

      syncResults.push({
        albumUrl,
        catalogueCode: catalogue.code,
        extractedCount: photos.length
      });
    }
  }

  // Update sync metadata in Firestore
  await db.collection("catalogue_config").doc("sync_status").set({
    lastVerifiedAt: syncTimestamp,
    totalExtracted,
    syncResults
  });

  return { syncTimestamp, totalExtracted, syncResults };
}

/**
 * HTTP Endpoint: /syncGooglePhotos
 * Triggered via HTTP request or mobile dashboard "Refresh Stock Now" button
 */
export const syncGooglePhotos = onRequest({ cors: true }, async (req, res) => {
  try {
    const result = await executeInventorySync();
    res.status(200).json({
      success: true,
      message: "Google Photos live stock sync complete!",
      data: result
    });
  } catch (err) {
    console.error("Cloud Sync Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Scheduled Cron Job: Runs automatically every 30 minutes in the cloud
 */
export const scheduledGooglePhotosSync = onSchedule("every 30 minutes", async () => {
  console.log("Running scheduled Google Photos album sync...");
  await executeInventorySync();
  console.log("Scheduled sync completed successfully.");
});
