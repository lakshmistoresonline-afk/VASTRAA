import { CATALOGUES } from '../data/catalogues';
import { resolveAlbumPhotos, checkImageUrlValidity } from './googlePhotosService';

let catalogueCache = {};
let lastSyncTimestamp = null;

// Synchronise a single album or all catalogues using the genuine extracted sarees dataset (3,252 photos) and specific category pricing
export async function syncShowroomCatalogues(options = {}) {
  const syncTimestamp = new Date().toISOString();
  const { specificCatalogueCode = null, forceErrorForAlbum = null, mockRemovedIds = [] } = options || {};

  const cataloguesToSync = specificCatalogueCode
    ? CATALOGUES.filter(c => c.code === specificCatalogueCode)
    : CATALOGUES;

  let allItems = [];
  let confirmedAvailable = 0;
  let unknown = 0;
  let unavailable = 0;
  const failures = [];

  for (const catalogue of cataloguesToSync) {
    for (const albumUrl of catalogue.albums) {
      if (forceErrorForAlbum && albumUrl === forceErrorForAlbum) {
        failures.push({
          albumUrl,
          catalogueName: catalogue.name,
          error: "Google Photos API Network Error: Unable to fetch album endpoint"
        });
        unknown++;
        allItems.push({
          id: `gphoto_${catalogue.code}_err01`,
          title: `${catalogue.name} - Failed Weave`,
          imageUrl: '',
          albumUrl: albumUrl,
          catalogueId: catalogue.id,
          catalogueCode: catalogue.code,
          categoryName: catalogue.name,
          indicativePriceRange: catalogue.indicativePriceRange,
          minPrice: catalogue.minPrice,
          maxPrice: catalogue.maxPrice,
          price: catalogue.minPrice,
          stockStatus: 'UNKNOWN',
          lastVerifiedAt: syncTimestamp,
          description: 'Failed album sync'
        });
        continue;
      }

      try {
        const albumPhotos = await resolveAlbumPhotos(albumUrl, {
          forceError: false,
          mockRemovedIds,
          catalogueCode: catalogue.code
        });

        for (const photo of albumPhotos) {
          const isRemoved = mockRemovedIds.includes(photo.id);
          const status = isRemoved ? 'UNAVAILABLE' : 'CONFIRMED_AVAILABLE';

          if (status === 'CONFIRMED_AVAILABLE') {
            confirmedAvailable++;
          } else {
            unavailable++;
          }

          const priceSpread = catalogue.maxPrice - catalogue.minPrice;
          let defaultPrice = catalogue.minPrice + Math.floor(priceSpread * 0.35);

          switch (catalogue.code?.toUpperCase()) {
            case 'A': defaultPrice = 21500; break;
            case 'B': defaultPrice = 16500; break;
            case 'C': defaultPrice = 12500; break;
            case 'D': defaultPrice = 4500; break;
            case 'E': defaultPrice = 3900; break;
            case 'F': defaultPrice = 5500; break;
            case 'G': defaultPrice = 2350; break;
            case 'H': defaultPrice = 1950; break;
            case 'I': defaultPrice = 1950; break;
            default: break;
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
            price: photo.price || defaultPrice,
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
        unknown++;
      }
    }
  }

  // Deduplicate by photo ID
  const uniqueItemsMap = new Map();
  allItems.forEach(item => {
    uniqueItemsMap.set(item.id, item);
  });
  const uniqueItems = Array.from(uniqueItemsMap.values());

  const syncReport = {
    syncTimestamp,
    totalCatalogues: cataloguesToSync.length,
    totalSyncedItems: uniqueItems.length,
    confirmedAvailable: uniqueItems.filter(i => i.stockStatus === 'CONFIRMED_AVAILABLE').length,
    unavailable: uniqueItems.filter(i => i.stockStatus === 'UNAVAILABLE').length,
    unknown: uniqueItems.filter(i => i.stockStatus === 'UNKNOWN').length,
    failures
  };

  catalogueCache = {
    items: uniqueItems,
    syncStats: syncReport
  };
  lastSyncTimestamp = syncTimestamp;

  return catalogueCache;
}

export const syncAllCatalogues = syncShowroomCatalogues;

// Revalidate individual saree stock & price
export async function revalidateSareeStock(itemId) {
  const items = catalogueCache.items || [];
  const item = items.find(i => i.id === itemId) || { id: itemId, stockStatus: 'UNKNOWN', price: 0 };

  const isValid = await checkImageUrlValidity(item.imageUrl);
  if (!isValid || item.stockStatus !== 'CONFIRMED_AVAILABLE') {
    return {
      ...item,
      canOrder: false,
      message: 'Stock status cannot be confirmed or item is unavailable.'
    };
  }

  const canOrder = item.stockStatus === 'CONFIRMED_AVAILABLE' && item.price > 0;

  return {
    ...item,
    canOrder,
    message: canOrder
      ? 'Stock and price confirmed available.'
      : 'Item is currently unavailable.'
  };
}

export const revalidateItemStock = revalidateSareeStock;

export function getCatalogueCache() {
  return catalogueCache;
}

export function canDirectCheckout(item) {
  if (!item) return false;
  return item.stockStatus === 'CONFIRMED_AVAILABLE' && item.price !== null && item.price > 0;
}
