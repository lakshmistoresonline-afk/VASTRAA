# Lakshmi Stores — Google Photos Live Saree Catalogue
**Round West, Thrissur, Kerala, India**

![Lakshmi Stores Banner](https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200)

> **Tradition. Elegance. Trust.**  
> An e-commerce web platform for Lakshmi Stores, Thrissur, Kerala. Stock availability is synchronized in real-time with official Google Photos albums managed directly by store owners.

---

## 🌟 Key Features

* **Google Photos Source of Truth**: Live inventory synchronized directly with 9 Google Photos shared album categories. Photos added or deleted by store owners automatically update web availability.
* **9 Configured Catalogues (A to I)**:
  * **Catalogue A**: Kanchipuram Pure Wedding Silk Sarees (₹14,000–₹38,000)
  * **Catalogue B**: Kanchipuram 100% Pure Fancy Silk Sarees (₹12,000–₹19,500)
  * **Catalogue C**: Kanchipuram Pure Soft Silk Sarees (₹7,000–₹12,500)
  * **Catalogue D**: K.M.D Silk Sarees (Pure Silk Plus Mix) (₹5,000–₹8,000)
  * **Catalogue E**: Kanchi Semi Fancy Silk Sarees (₹2,500–₹7,500)
  * **Catalogue F**: Semi Kanchipuram Arts Silk Sarees (₹4,000–₹8,500)
  * **Catalogue G**: Gift Butta Arts Silk Sarees (₹2,000–₹4,100)
  * **Catalogue H**: Semi Arts Silks Plain D.P (₹1,500–₹2,800)
  * **Catalogue I**: Arts Silks R.P (₹1,800–₹2,800)
* **Stock & Price Safeguards**: Individual saree prices default to **"Price on enquiry"**. Direct online checkout is disabled unless an item is confirmed available and explicitly priced.
* **WhatsApp & Direct Enquiries**: Integrated modal enquiry submission and direct pre-filled WhatsApp links with saree ID and image URLs.
* **Owner Admin Dashboard**:
  * Live status for all 9 Google Photos album sources.
  * Trigger manual/scheduled catalogue refresh button.
  * Live inventory table with status indicators (`Live In Stock`, `Availability Confirmation Required`, `Unavailable/Removed`).
  * Customer enquiry management with status updates (`Pending`, `Contacted`, `Fulfilled`, `Cancelled`).
* **Firebase Security**: Firestore security rules enforcing read/write restrictions for admin portals and public enquiry creation.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend**: React 18, Vite 6, Tailwind CSS 4, React Router DOM 7, Redux Toolkit, Headless UI, React Icons
* **Services**: Google Photos API / Shared Album Resolver, StockSyncService
* **Database & Auth**: Firebase Firestore & Firebase Auth
* **Testing**: Vitest 5, React Testing Library, JSDOM
* **Styling**: Deep Maroon (`#800020`), Champagne Gold (`#D4AF37`), Warm Ivory (`#FAF8F5`)

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### 2. Installation
```bash
# Clone or navigate to the project root
cd G:/ecommerce-website-with-admin-dashboard

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials and WhatsApp contact details if deploying to live Firebase services.

### 4. Running Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Running Automated Tests
```bash
npm test
```
Executes all 12 mandatory unit and integration test cases covering album sync, removal detection, price policy safeguards, and account fallback.

### 6. Production Build & Linting
```bash
# Run ESLint
npm run lint

# Build production bundle
npm run build
```

---

## 🔐 Owner Admin Portal Access

* **URL**: `/dashboard`
* **Demo Credentials**:
  * **Email**: `admin@lakshmistores.com`
  * **Password**: `admin123`

---

## 📚 Documentation Links

* [Google Photos Integration Report](docs/GOOGLE_PHOTOS_INTEGRATION.md)
* [System Architecture Document](docs/ARCHITECTURE.md)
* [Automated Test Execution Report](docs/TEST_REPORT.md)

---

© 2026 Lakshmi Stores, Round West, Thrissur, Kerala, India.
