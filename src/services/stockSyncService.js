/**
 * Stock Sync & Availability Service
 * Lakshmi Stores, Thrissur, Kerala
 *
 * Manages live catalogue inventory derived from Google Photos albums.
 * Integrates with Firebase Serverless Cloud Functions and Firestore.
 */

import { CATALOGUES } from '../data/catalogues';
import { resolveAlbumPhotos, checkImageUrlValidity } from './googlePhotosService';

// In-memory sync state cache
let catalogueCache = {
  items: [],
  lastVerifiedAt: null,
  syncStats: {
    totalCatalogues: CATALOGUES.length,
    totalItems: 0,
    confirmedAvailable: 0,
    unavailable: 0,
    unknown: 0,
    failures: []
  }
};

/**
 * Trigger Serverless Cloud Sync (Firebase Cloud Function)
 */
export async function triggerServerlessCloudSync() {
  try {
    const res = await fetch("/api/syncGooglePhotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
  } catch (err) {
    console.warn("Serverless Cloud Sync endpoint notice:", err.message);
  }
  // Fallback local catalogue resolution
  return await syncAllCatalogues();
}

/**
 * Perform a full inventory sync across configured catalogue sources
 *
 * @param {object} options - Optional sync flags { forceErrorForAlbum, mockRemovedIds }
 * @returns {Promise<object>} Complete synced items and summary statistics
 */
export async function syncAllCatalogues(options = {}) {
  const { forceErrorForAlbum = null, mockRemovedIds = [] } = options;

  const allItems = [];
  const failures = [];
  const knownItemIds = new Set();

  let confirmedCount = 0;
  let unavailableCount = 0;
  let unknownCount = 0;

  const syncTimestamp = new Date().toISOString();

  for (const catalogue of CATALOGUES) {
    for (const albumUrl of catalogue.albums) {
      try {
        const shouldForceError = forceErrorForAlbum === albumUrl;
        const albumPhotos = await resolveAlbumPhotos(albumUrl, {
          catalogueCode: catalogue.code,
          forceError: shouldForceError,
          mockRemovedIds
        });

        for (const photo of albumPhotos) {
          if (knownItemIds.has(photo.id)) {
            continue;
          }
          knownItemIds.add(photo.id);

          const isUrlValid = await checkImageUrlValidity(photo.imageUrl);
          const status = isUrlValid ? 'CONFIRMED_AVAILABLE' : 'UNKNOWN';

          if (status === 'CONFIRMED_AVAILABLE') {
            confirmedCount++;
          } else {
            unknownCount++;
          }

          allItems.push({
            id: photo.id,
            title: photo.title,
            imageUrl: photo.imageUrl,
            albumUrl: albumUrl,
            catalogueId: catalogue.id,
            catalogueCode: catalogue.code,
            categoryName: catalogue.name,
            indicativePriceRange: catalogue.indicativePriceRange,
            minPrice: catalogue.minPrice,
            maxPrice: catalogue.maxPrice,
            price: null, // Individual price on enquiry
            stockStatus: status,
            lastVerifiedAt: syncTimestamp,
            description: `${catalogue.name} - Individual saree stock photo from Lakshmi Stores Google Photos catalogue.`
          });
        }
      } catch (err) {
        console.error(`Sync error for album [${albumUrl}]:`, err.message);
        failures.push({
          albumUrl,
          catalogueName: catalogue.name,
          error: err.message
        });
        unknownCount++;
      }
    }
  }

  if (catalogueCache.items.length > 0) {
    for (const cachedItem of catalogueCache.items) {
      if (!knownItemIds.has(cachedItem.id)) {
        allItems.push({
          ...cachedItem,
          stockStatus: 'UNAVAILABLE',
          lastVerifiedAt: syncTimestamp
        });
        unavailableCount++;
      }
    }
  }

  if (mockRemovedIds.length > 0) {
    for (const item of allItems) {
      if (mockRemovedIds.includes(item.id)) {
        if (item.stockStatus === 'CONFIRMED_AVAILABLE') {
          confirmedCount--;
          item.stockStatus = 'UNAVAILABLE';
          unavailableCount++;
        }
      }
    }
  }

  catalogueCache = {
    items: allItems,
    lastVerifiedAt: syncTimestamp,
    syncStats: {
      totalCatalogues: CATALOGUES.length,
      totalItems: allItems.length,
      confirmedAvailable: confirmedCount,
      unavailable: unavailableCount,
      unknown: unknownCount,
      failures
    }
  };

  return catalogueCache;
}

/**
 * Revalidate a specific item immediately before processing an enquiry or order
 */
export async function revalidateItemStock(itemId) {
  const item = catalogueCache.items.find(i => i.id === itemId);
  if (!item) {
    return {
      itemId,
      stockStatus: 'UNAVAILABLE',
      canOrder: false,
      message: 'Product is no longer listed in active catalogue.'
    };
  }

  if (item.stockStatus === 'UNKNOWN') {
    const isValid = await checkImageUrlValidity(item.imageUrl);
    if (!isValid) {
      return {
        ...item,
        stockStatus: 'UNKNOWN',
        canOrder: false,
        message: 'Stock status cannot be confirmed due to Google Photos connection failure.'
      };
    }
  }

  const canOrder = item.stockStatus === 'CONFIRMED_AVAILABLE' && item.price !== null && item.price > 0;

  return {
    ...item,
    canOrder,
    message: canOrder
      ? 'Stock confirmed available.'
      : item.stockStatus === 'CONFIRMED_AVAILABLE'
        ? 'Price on enquiry required.'
        : 'Item is currently unavailable.'
  };
}

export function getCatalogueCache() {
  return catalogueCache;
}

export function canDirectCheckout(item) {
  if (!item) return false;
  return item.stockStatus === 'CONFIRMED_AVAILABLE' && item.price !== null && item.price > 0;
}
