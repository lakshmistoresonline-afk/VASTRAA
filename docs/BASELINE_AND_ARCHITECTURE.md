# 🏛️ VASTRAA — BASELINE & SYSTEM ARCHITECTURE REPORT

**Repository**: `https://github.com/lakshmistoresonline-afk/VASTRAA.git`  
**Base Branch**: `main`  
**Working Feature Branch**: `fix/recursive-production-readiness`  
**Baseline Commit SHA**: `62d698c`  
**Firebase Project**: `vastraa-c7da1`

---

## 1. System Architecture & Component Mapping

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND STOREFRONT                                |
|  React 18 + Vite 6 + Tailwind CSS 4 + Headless UI + Redux Toolkit + React Router  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                              FIREBASE AUTHENTICATION                              |
|           `AuthContext.jsx` with `onAuthStateChanged` reactive listener           |
|            Canonical Customer Profile Path: `users/{firebaseAuthUid}`             |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                              CLOUD FIRESTORE DATABASE                             |
|                Least-Privilege Security Rules (`firestore.rules`)                 |
|   Collections: users, enquiries, orders, products, catalogue_config, jobs        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                            SERVERLESS CLOUD FUNCTIONS                             |
|          `syncGooglePhotos` • `scheduledGooglePhotosSync` (every 30m)            |
|                   `sendOwnerWhatsAppNotification` (v2 API)                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Master Catalogue Architecture (Catalogues A–I)

| Code | Collection Name | Price Spectrum | Google Photos Albums | Total Saree Count |
| :---: | :--- | :---: | :---: | :---: |
| **A** | Kanchipuram Pure Wedding Silk Sarees | `₹25,200–₹27,300` | 2 Albums | ~300 Sarees |
| **B** | Kanchipuram Pure Fancy Silk Sarees | `₹17,325–₹18,375` | 2 Albums | ~350 Sarees |
| **C** | Kanchipuram Pure Soft Silk Sarees | `₹13,125–₹14,175` | 1 Album | ~400 Sarees |
| **D** | Semi Silk Sarees | `₹4,635–₹5,665` | 1 Album | ~350 Sarees |
| **E** | Semi Fancy Silk Sarees | `₹3,915–₹4,635` | 1 Album | ~350 Sarees |
| **F** | Semi Kanchipuram Art Silk Sarees | `₹5,460–₹6,300` | 1 Album | ~350 Sarees |
| **G** | Butta Art Silk Sarees | `₹2,370–₹3,040` | 1 Album | ~350 Sarees |
| **H** | Semi Art Silk Sarees | `₹1,955–₹2,320` | 1 Album | ~400 Sarees |
| **I** | Arts Silk Sarees | `₹1,955–₹2,320` | 1 Album | ~400 Sarees |
| **ALL**| **Master Catalogue Total** | **`₹1,955–₹27,300`** | **11 Albums** | **3,252 Sarees** |

---

## 3. Baseline Quality Audit Results

```bash
npm run lint
npm test
npm run build
```

* **ESLint Code Quality**: **0 ERRORS (`PASSED`)**
* **Vitest Unit & Security Suite**: **18/18 PASSED (`100%`)**
* **Vite Production Build**: **SUCCESS (`built in 4.16s`)**
