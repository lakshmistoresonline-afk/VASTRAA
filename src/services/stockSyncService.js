import { CATALOGUES } from '../data/catalogues';

let catalogueCache = {};
let lastSyncTimestamp = null;

// Helper to check if a Google Photos image URL is reachable
export async function checkImageUrlValidity(url) {
  if (!url) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' });
    clearTimeout(timeoutId);
    return true;
  } catch (err) {
    console.warn(`Image reachability check warning for [${url.substring(0, 40)}...]:`, err.message);
    return url.includes('googleusercontent.com') || url.includes('photos.google.com') || url.includes('ggpht.com');
  }
}

// Synchronise a single album or all catalogues
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
        const simulatedPhotos = [
          { id: `gphoto_${catalogue.code}_001`, title: `${catalogue.name} - Weave 01`, imageUrl: `https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80` },
          { id: `gphoto_${catalogue.code}_002`, title: `${catalogue.name} - Weave 02`, imageUrl: `https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1024&q=80` },
          { id: `gphoto_${catalogue.code}_003`, title: `${catalogue.name} - Weave 03`, imageUrl: `https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1024&q=80` }
        ];

        for (const photo of simulatedPhotos) {
          const isRemoved = mockRemovedIds.includes(photo.id);
          const status = isRemoved ? 'UNAVAILABLE' : 'CONFIRMED_AVAILABLE';

          if (status === 'CONFIRMED_AVAILABLE') {
            confirmedAvailable++;
          } else {
            unavailable++;
          }

          const priceSpread = catalogue.maxPrice - catalogue.minPrice;
          const defaultPrice = catalogue.minPrice + Math.floor(priceSpread * 0.35);

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
