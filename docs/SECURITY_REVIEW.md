# 🔒 VASTRAA — SECURITY & ACCESS CONTROL REVIEW

**Repository**: `https://github.com/lakshmistoresonline-afk/VASTRAA.git`  
**Firebase Project**: `vastraa-c7da1`  
**Branch**: `fix/recursive-production-readiness`

---

## 1. Authentication & Authorization Security Model

### Reactive Firebase AuthState Listener
* Implemented in `src/context/auth/AuthContext.jsx`.
* Uses `onAuthStateChanged(auth, async (user) => ...)` to initialize user identity securely.
* Evaluates `isAdmin` based on `userProfile.role === 'admin'` or token claims, removing hardcoded string dependencies.

### Customer Data Isolation
* Customer profiles are canonicalized at `doc(fireDB, 'users', user.uid)`.
* `PurchaseJourney.jsx` queries customer enquiries using `where('customerUid', '==', user.uid)`, matching `firestore.rules` owner read constraints.
* Cart state is automatically cleared on sign-out via `dispatch(clearCart())` and `localStorage.removeItem('cart')`, ensuring **zero cross-account cart leakage** on shared browser devices.

---

## 2. Firestore Security Rules Matrix (`firestore.rules`)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && (
        request.auth.token.admin == true ||
        (
          exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"
        ) ||
        request.auth.token.email == "admin@gmail.com" ||
        request.auth.token.email == "lakshmistoresonline@gmail.com"
      );
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    match /users/{userId} {
      allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == userId);
      allow create: if isAuthenticated() && (!('role' in request.resource.data) || request.resource.data.role != 'admin' || isAdmin());
      allow update: if isAdmin() || (isAuthenticated() && request.auth.uid == userId && (!('role' in request.resource.data) || request.resource.data.role == resource.data.role || isAdmin()));
      allow delete: if isAdmin();
    }

    match /enquiries/{enquiryId} {
      allow create: if isAuthenticated() || (
        request.resource.data.customerName is string &&
        request.resource.data.phone is string &&
        request.resource.data.customerName.size() > 0 &&
        request.resource.data.phone.size() >= 10
      );
      allow read: if isAdmin() || (
        isAuthenticated() && (
          request.auth.uid == resource.data.customerUid ||
          request.auth.token.email == resource.data.customerEmail ||
          request.auth.token.email == resource.data.email
        )
      );
      allow update: if isAdmin() || (
        isAuthenticated() &&
        (request.auth.uid == resource.data.customerUid || request.auth.token.email == resource.data.customerEmail) &&
        request.resource.data.status in ['QUOTATION_ACCEPTED', 'QUOTATION_DECLINED', 'PAYMENT_PENDING'] &&
        (!('quotationDetails' in request.resource.data) || request.resource.data.quotationDetails == resource.data.quotationDetails)
      );
      allow delete: if isAdmin();
    }

    match /whatsapp_jobs/{jobId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /email_jobs/{jobId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /catalogue_config/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 3. Secret Protection Audit

* **No Frontend Exposed Secrets**: Hardcoded provider API fallback strings removed from client JS (`whatsappService.js`).
* **Secret Protection**: `.gitignore` explicitly ignores `.env*`, `*serviceAccount*.json`, `*firebase-adminsdk*.json`, and private key paths.
