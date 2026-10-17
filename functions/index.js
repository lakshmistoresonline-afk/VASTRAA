import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// Catalogues A, B & C Album Configuration
const ALBUM_CONFIGS = [
  {
    code: "A",
    catalogueId: "kanchipuram-pure-wedding-silk",
    categoryName: "Kanchipuram Pure Wedding Silk Sarees",
    indicativePriceRange: "₹13,500–₹32,500",
    albums: [
      "https://photos.app.goo.gl/pOvLBxk4N3ojCnmp2",
      "https://photos.app.goo.gl/7nOr1gWP5mkjwfFu1"
    ]
  },
  {
    code: "B",
    catalogueId: "kanchipuram-pure-fancy-silk",
    categoryName: "Kanchipuram Pure Fancy Silk Sarees",
    indicativePriceRange: "₹12,500–₹18,500",
    albums: [
      "https://photos.app.goo.gl/pz6VcrL9fSlxekUu2",
      "https://photos.app.goo.gl/1CsVnqOHO82n5FZS2"
    ]
  },
  {
    code: "C",
    catalogueId: "kanchipuram-pure-soft-silk",
    categoryName: "Kanchipuram Pure Soft Silk Sarees",
    indicativePriceRange: "₹8,000–₹13,000",
    albums: [
      "https://photos.app.goo.gl/jcEruUx6uTlPrugM2"
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
