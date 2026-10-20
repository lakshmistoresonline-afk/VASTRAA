# Vastraa — Traditional Weaves • Timeless Beauty
**A Co-Brand of Lakshmi Stores | Round West, Thrissur, Kerala, India**

![Vastraa Banner](public/images/hero/hero-desktop.jpg)

> **Tradition. Elegance. Trust.**  
> An e-commerce web platform for Vastraa (A Co-Brand of Lakshmi Stores), Thrissur, Kerala. Stock availability is synchronized in real-time with official showroom inventory feeds.

---

## 🌟 Key Features

* **Live Inventory Source**: Live inventory synchronized directly with 9 Google Photos shared album categories (A through I). Photos added or deleted by store owners automatically update web availability.
* **All 9 Configured Catalogues (A to I)**:
  * **Catalogue A**: Kanchipuram Pure Wedding Silk Sarees (₹13,500–₹32,500)
  * **Catalogue B**: Kanchipuram Pure Fancy Silk Sarees (₹12,500–₹18,500)
  * **Catalogue C**: Kanchipuram Pure Soft Silk Sarees (₹7,500–₹13,000)
  * **Catalogue D**: Semi Silk Sarees (₹4,500–₹6,000)
  * **Catalogue E**: Semi Fancy Silk Sarees (₹2,500–₹4,000)
  * **Catalogue F**: Semi Kanchipuram Art Silk Sarees (₹3,500–₹6,000)
  * **Catalogue G**: Butta Art Silk Sarees (₹2,000–₹3,500)
  * **Catalogue H**: Semi Art Silk Sarees (₹1,500–₹3,000)
  * **Catalogue I**: Arts Silk Sarees (₹1,500–₹3,000)
* **Stock & Price Safeguards**: Individual saree prices default to **"Price on enquiry"**. Direct online checkout is disabled unless an item is confirmed available and explicitly priced.
* **WhatsApp & Direct Enquiries**: Integrated modal enquiry submission and direct pre-filled WhatsApp links with saree ID and image URLs.
* **Owner Admin Dashboard**:
  * Live status for all 9 album sources.
  * Trigger manual/scheduled catalogue refresh button.
  * Live inventory table with status indicators (`Live In Stock`, `Availability Confirmation Required`, `Unavailable/Removed`).
  * Customer enquiry management with status updates (`Pending`, `Contacted`, `Fulfilled`, `Cancelled`).
* **Firebase Security**: Firestore security rules enforcing least-privilege read/write restrictions for admin portals and customer enquiry creation.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend**: React 18, Vite 6, Tailwind CSS 4, React Router DOM 7, Redux Toolkit, Headless UI, React Icons
* **Services**: Google Photos API / Shared Album Resolver, StockSyncService
* **Database & Auth**: Firebase Firestore & Firebase Auth
* **Testing**: Vitest 5, React Testing Library, JSDOM
* **Styling**: Deep Maroon (`#800020`), Champagne Gold (`#C5A46D`), Warm Ivory (`#FAF7F0`)

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### 2. Installation
```bash
# Clone or navigate to the project root
git clone https://github.com/lakshmistoresonline-afk/VASTRAA.git
cd VASTRAA

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
Executes all 12 mandatory unit and integration test cases.

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
* **Authorized Administrator Emails**:
  * `lakshmistoresonline@gmail.com`
  * `admin@vastraa.com`
  * `admin@lakshmistores.com`

---

## 📚 Documentation Links

* [Google Photos Integration Report](docs/GOOGLE_PHOTOS_INTEGRATION.md)
* [System Architecture Document](docs/ARCHITECTURE.md)
* [Automated Test Execution Report](docs/TEST_REPORT.md)

---

© 2026 Vastraa — A Co-Brand of Lakshmi Stores, Round West, Thrissur, Kerala, India.
