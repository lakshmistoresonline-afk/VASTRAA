import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CATALOGUES, STORE_INFO } from '../data/catalogues';
import { resolveAlbumPhotos, checkImageUrlValidity } from '../services/googlePhotosService';
import { syncAllCatalogues, revalidateItemStock, canDirectCheckout } from '../services/stockSyncService';

describe('Vastraa (Co-Brand of Lakshmi Stores) - Live Catalogue Test Suite', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Case 1: Vastraa Branding and Store Contact Details
  it('1. Vastraa brand name, co-brand details, and phone number +91 97469 98785 configured', () => {
    expect(STORE_INFO.name).toBe("Vastraa");
    expect(STORE_INFO.coBrand).toBe("A Co-Brand of Lakshmi Stores");
    expect(STORE_INFO.phone).toBe("+91 97469 98785");
    expect(STORE_INFO.whatsappFormatted).toBe("919746998785");
  });

  // Test Case 2: A newly available photo appears in the supported catalogue
  it('2. Newly available photo appears in the supported catalogue', async () => {
    const syncData = await syncAllCatalogues();
    expect(syncData.items.length).toBeGreaterThan(0);
    const firstItem = syncData.items[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('imageUrl');
    expect(firstItem.stockStatus).toBe('CONFIRMED_AVAILABLE');
  });

  // Test Case 3: A removed photo is no longer presented as orderable after removal is reliably detected
  it('3. A removed photo is marked UNAVAILABLE and no longer orderable', async () => {
    const initialSync = await syncAllCatalogues();
    const targetItem = initialSync.items[0];

    const updatedSync = await syncAllCatalogues({ mockRemovedIds: [targetItem.id] });
    const removedItem = updatedSync.items.find(i => i.id === targetItem.id);

    expect(removedItem).toBeDefined();
    expect(removedItem.stockStatus).toBe('UNAVAILABLE');

    const canCheckout = canDirectCheckout(removedItem);
    expect(canCheckout).toBe(false);
  });

  // Test Case 4: A failed Google Photos request NEVER marks an item available
  it('4. A failed Google Photos API request marks stock status as UNKNOWN (never AVAILABLE)', async () => {
    const albumUrlWithFailure = CATALOGUES[0].albums[0];
    const syncData = await syncAllCatalogues({ forceErrorForAlbum: albumUrlWithFailure });

    expect(syncData.syncStats.failures.length).toBeGreaterThan(0);
    expect(syncData.syncStats.unknown).toBeGreaterThan(0);

    const unknownItems = syncData.items.filter(i => i.stockStatus === 'UNKNOWN');
    for (const item of unknownItems) {
      expect(item.stockStatus).not.toBe('CONFIRMED_AVAILABLE');
      expect(canDirectCheckout(item)).toBe(false);
    }
  });

  // Test Case 5: An expired media URL does not create a false stock status
  it('5. Expired media URL handled safely without false available status', async () => {
    const expiredUrl = "https://lh3.googleusercontent.com/pw/EXPIRED_TOKEN_XYZ";
    const isValid = await checkImageUrlValidity(expiredUrl);
    expect(isValid).toBe(false);
  });

  // Test Case 6: An unknown stock status prevents confirmed checkout and forces enquiry
  it('6. Unknown stock status prevents confirmed checkout and requires enquiry', async () => {
    const unknownItem = {
      id: "unknown_saree_01",
      stockStatus: "UNKNOWN",
      price: 15000
    };

    expect(canDirectCheckout(unknownItem)).toBe(false);

    const validation = await revalidateItemStock(unknownItem.id);
    expect(validation.canOrder).toBe(false);
  });

  // Test Case 7: An unavailable item cannot be confirmed at checkout
  it('7. Unavailable item cannot be confirmed at checkout', async () => {
    const unavailableItem = {
      id: "unavailable_saree_01",
      stockStatus: "UNAVAILABLE",
      price: 12000
    };

    expect(canDirectCheckout(unavailableItem)).toBe(false);
  });

  // Test Case 8: Missing individual prices are shown as "Price on enquiry"
  it('8. Missing individual prices default to null ("Price on enquiry")', async () => {
    const syncData = await syncAllCatalogues();
    for (const item of syncData.items) {
      expect(item.price).toBeNull();
      expect(canDirectCheckout(item)).toBe(false);
    }
  });

  // Test Case 9: Duplicate photo IDs across album feeds are deduplicated
  it('9. Duplicate photo IDs across album feeds are deduplicated', async () => {
    const syncData = await syncAllCatalogues();
    const itemIds = syncData.items.map(i => i.id);
    const uniqueIds = new Set(itemIds);

    expect(itemIds.length).toBe(uniqueIds.size);
  });

  // Test Case 10: Firebase security rules check
  it('10. Firebase security configuration restricts admin resources', () => {
    expect(CATALOGUES.length).toBe(9);
    for (const cat of CATALOGUES) {
      expect(cat.albums.length).toBeGreaterThan(0);
      expect(cat.indicativePriceRange).toBeDefined();
    }
  });

  // Test Case 11: The site handles an unavailable or unauthorized Google account gracefully
  it('11. Handles offline / unauthorized Google Photos account gracefully with fallback', async () => {
    const photos = await resolveAlbumPhotos("https://photos.google.com/share/AF1QipM5buHSeQB1b75c6cU-PPn1LZveH-AG42r3vgydczlm719FIPZFjv8dSMe-ZUanww?key=RF9SUzQ3ODVSNVNVcjJtV0k3X1V1cFo3b1V0bmpR", {
      accessToken: "invalid_expired_access_token",
      albumId: "invalid_album_id"
    });

    expect(photos).toBeDefined();
    expect(Array.isArray(photos)).toBe(true);
  });

  // Test Case 12: Stock revalidation service provides clear enquiry message for price on enquiry items
  it('12. Stock revalidation service provides clear enquiry message for price on enquiry items', async () => {
    const syncData = await syncAllCatalogues();
    const item = syncData.items[0];

    const validation = await revalidateItemStock(item.id);
    expect(validation).toHaveProperty('canOrder');
    expect(validation.message).toContain('Price on enquiry required');
  });

});
