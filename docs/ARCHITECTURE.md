# System Architecture Document
**Lakshmi Stores, Round West, Thrissur, Kerala, India**

## 1. High-Level System Architecture

```
[ Store Owner (Google Photos Mobile App) ]
                   │
                   ▼ Updates Albums (Adds/Deletes Saree Photos)
[ 9 Google Photos Shared Album Sources (Catalogues A-I) ]
                   │
                   ▼ Live Sync / Fetch
[ StockSyncService & GooglePhotosService ] ──▶ [ Pre-Order Stock Revalidation ]
                   │
                   ├──▶ [ React Storefront (Tailwind + Brand Theme) ]
                   │        ├── Category Explorer (9 Catalogues A-I)
                   │        ├── Saree Grid & Image Enlargement Viewer
                   │        └── Availability & Price Enquiry Modal / WhatsApp
                   │
                   └──▶ [ Owner Admin Dashboard ]
                            ├── Album Sync Status & Trigger Sync Button
                            ├── Live Inventory Table
                            └── Customer Enquiry Management
                   │
                   ▼ Firestore Database
[ Firebase Security Rules + Auth + Enquiries Collection ]
```

---

## 2. Core Modules & Data Services

### A. `src/data/catalogues.js`
Defines the 9 master saree catalogue categories, indicative price ranges, album source URLs, and Thrissur store details.

### B. `src/services/googlePhotosService.js`
Handles Google Photos shared album URL resolution, media item extraction, and OAuth2 Google Photos Library API integration fallback.

### C. `src/services/stockSyncService.js`
Manages live stock state, removal detection, deduplication, URL expiration validation, and pre-submission revalidation.

### D. `src/context/data/myState.jsx`
React context provider holding live inventory, sync statistics, customer enquiries, theme mode, and store settings.

### E. Firebase Security (`firestore.rules`)
Enforces strict Firestore security rules preventing unauthorized write operations to admin settings while allowing customer enquiry submission.

---

## 3. Brand Identity & Design Tokens

* **Primary Brand Color**: Deep Maroon (`#800020`)
* **Secondary Gold Accent**: Champagne Gold (`#D4AF37` / `#E5C158`)
* **Background Theme**: Warm Ivory (`#FAF8F5`) and Dark Mode (`#111827`)
* **Typography**: Serif titles for textile heritage, clean sans-serif for numbers & navigation.
