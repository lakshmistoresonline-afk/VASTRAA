# Google Photos API Integration Analysis & Technical Report
**Lakshmi Stores, Round West, Thrissur, Kerala, India**

## 1. Executive Summary & Source of Truth

Lakshmi Stores manages its active saree stock directly in Google Photos. Store owners continuously upload photos of newly arrived sarees and remove photos of sold sarees across nine designated Google Photos shared albums.

This application uses **Google Photos as the single source of truth for product availability**. No competing manual stock management system is created.

---

## 2. Technical Capabilities & API Investigation Findings

### A. Official Google Photos REST API & OAuth 2.0
* **API Endpoints**: `https://photoslibrary.googleapis.com/v1/albums` and `https://photoslibrary.googleapis.com/v1/mediaItems:search`
* **OAuth Scopes Required**: `https://www.googleapis.com/auth/photoslibrary.readonly` or `https://www.googleapis.com/auth/photopicker.mediaitems.readonly`
* **Album Link Limitation**: Official REST endpoints accept internal Google `albumId` strings (e.g. `ALBUM_ID_XYZ`), but do **not** accept raw public `https://photos.app.goo.gl/...` redirection shortlinks directly.
* **Access Lifetime**: Media item URLs returned by Google Photos API (`lh3.googleusercontent.com/pw/...`) are temporary CDN URLs (valid for 60 minutes to several hours). Static storage of image URLs in a database without re-fetching is unsupported and results in broken images.

### B. Shared Google Photos Album Resolver Engine
* **Shortlink Processing**: Public shortlinks (`https://photos.app.goo.gl/...`) resolve to Google Photos shared album web pages.
* **Enumeration Capability**: All photos present in each of the 9 configured albums are enumerated automatically.
* **Addition & Removal Detection**:
  * **Additions**: Newly added photos in the album appear in the latest sync call and are flagged as `CONFIRMED_AVAILABLE`.
  * **Removals**: Photos removed from the album by store owners are detected during synchronization and immediately updated to `UNAVAILABLE` stock status.
  * **Failed API Checks**: Network or API failures set the item status to `UNKNOWN`. **Crucially, a failed request NEVER marks an item as available.**

---

## 3. The 9 Configured Saree Catalogues

1. **Catalogue A — Kanchipuram Pure Wedding Silk Sarees**
   * Indicative Range: ₹14,000–₹38,000
   * Albums:
     * `https://photos.app.goo.gl/pOvLBxk4N3ojCnmp2`
     * `https://photos.app.goo.gl/7nOr1gWP5mkjwfFu1`

2. **Catalogue B — Kanchipuram 100% Pure Fancy Silk Sarees**
   * Indicative Range: ₹12,000–₹19,500
   * Albums:
     * `https://photos.app.goo.gl/pz6VcrL9fSlxekUu2`
     * `https://photos.app.goo.gl/1CsVnqOHO82n5FZS2`

3. **Catalogue C — Kanchipuram Pure Soft Silk Sarees**
   * Indicative Range: ₹7,000–₹12,500
   * Album: `https://photos.app.goo.gl/jcEruUx6uTlPrugM2`

4. **Catalogue D — K.M.D Silk Sarees (Pure Silk Plus Mix)**
   * Indicative Range: ₹5,000–₹8,000
   * Album: `https://photos.app.goo.gl/wdaYj6JmSM4MB3A12`

5. **Catalogue E — Kanchi Semi Fancy Silk Sarees**
   * Indicative Range: ₹2,500–₹7,500
   * Album: `https://photos.app.goo.gl/RlWLhQvGwsjUk4g32`

6. **Catalogue F — Semi Kanchipuram Arts Silk Sarees**
   * Indicative Range: ₹4,000–₹8,500
   * Album: `https://photos.app.goo.gl/AYARfDU32mkMtKVy6`

7. **Catalogue G — Gift Butta Arts Silk Sarees**
   * Indicative Range: ₹2,000–₹4,100
   * Album: `https://photos.app.goo.gl/e7piP5ZB5f5uuYhY2`

8. **Catalogue H — Semi Arts Silks Plain D.P**
   * Indicative Range: ₹1,500–₹2,800
   * Album: `https://photos.app.goo.gl/Pn1iGTgBzOjd7nAl2`

9. **Catalogue I — Arts Silks R.P**
   * Indicative Range: ₹1,800–₹2,800
   * Album: `https://photos.app.goo.gl/nryQi1jy14qa2eW77`

---

## 4. Availability & Price Policy Rules

1. **Category Indicative Price Ranges vs. Individual Prices**:
   * Google Photos album images do not include embedded price tags.
   * Category ranges are indicative. Individual saree prices default to **"Price on Enquiry"**.
2. **Checkout Safety Controls**:
   * Direct online purchase/checkout is **disabled** unless stock status is `CONFIRMED_AVAILABLE` **AND** an explicit individual price is confirmed.
   * Otherwise, the customer is presented with **"Request Availability & Price"** or direct **WhatsApp Enquiry**.
3. **Pre-Submission Revalidation**:
   * Immediately before accepting a customer enquiry or order, `StockSyncService` revalidates image availability.
