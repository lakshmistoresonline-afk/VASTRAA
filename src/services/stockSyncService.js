import { CATALOGUES } from '../data/catalogues';
import { resolveAlbumPhotos, checkImageUrlValidity } from './googlePhotosService';

let catalogueCache = {};
let lastSyncTimestamp = null;

// Helper to compute a non-linear MurmurHash3 scrambled price within a min-max range (breaks sequential ordering)
function getNonLinearShuffledPrice(idString, minP, maxP) {
  let num = 0;
  for (let i = 0; i < idString.length; i++) {
    num = (num * 31 + idString.charCodeAt(i)) >>> 0;
  }
  // MurmurHash3 32-bit integer finalizer (completely breaks linear sequential increments)
  num ^= num >>> 16;
  num = Math.imul(num, 0x85ebca6b) >>> 0;
  num ^= num >>> 13;
  num = Math.imul(num, 0xc2b2ae35) >>> 0;
  num ^= num >>> 16;

  const range = maxP - minP;
  if (range <= 0) return minP;
  const steps = Math.floor(range / 50);
  const stepIndex = num % (steps + 1);
  return minP + (stepIndex * 50);
}

// Synchronise a single album or all catalogues using the genuine extracted sarees dataset (3,252 photos) and non-linear range pricing
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

          let minP = catalogue.minPrice;
          let maxP = catalogue.maxPrice;

          switch (catalogue.code?.toUpperCase()) {
            case 'A': minP = 25200; maxP = 27300; break; // +5%
            case 'B': minP = 17325; maxP = 18375; break; // +5%
            case 'C': minP = 13125; maxP = 14175; break; // +5%
            case 'F': minP = 5460; maxP = 6300; break;   // +5%
            case 'D': minP = 4635; maxP = 5665; break;   // +3%
            case 'E': minP = 3915; maxP = 4635; break;   // +3%
            case 'G': minP = 2370; maxP = 3040; break;   // +3%
            case 'H': minP = 1955; maxP = 2320; break;   // +3%
            case 'I': minP = 1955; maxP = 2320; break;   // +3%
            default: break;
          }

          const defaultPrice = getNonLinearShuffledPrice(photo.id, minP, maxP);

          allItems.push({
            id: photo.id,
            title: photo.title,
            imageUrl: photo.imageUrl,
            albumUrl: albumUrl,
            catalogueId: catalogue.id,
            catalogueCode: catalogue.code,
            categoryName: catalogue.name,
            indicativePriceRange: catalogue.indicativePriceRange,
            minPrice: minP,
            maxPrice: maxP,
            price: photo.price || defaultPrice,
            stockStatus: status,
            lastVerifiedAt: syncTimestamp,
            description: `${catalogue.name} - Individual saree stock photo from online catalogue.`
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
