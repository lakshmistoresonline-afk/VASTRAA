# 📦 VASTRAA — DATA MIGRATION & RECOVERY GUIDE

**Repository**: `https://github.com/lakshmistoresonline-afk/VASTRAA.git`  
**Branch**: `feat/hardening-security-fixes`  
**Firebase Project**: `vastraa-c7da1`

---

## 1. Schema Standardization & Canonical User Profiles

### User Profile Canonical Path
* All customer user profile documents are created under `doc(fireDB, 'users', user.uid)`.
* **Legacy Support**: Queries that locate user profiles match on `user.uid` as primary key, with fallback to `where('email', '==', cleanEmail)`. Legacy profile documents created with auto-generated IDs are merged seamlessly upon customer login without data loss.

### Firestore Security Rule Schema Validation
```rules
match /users/{userId} {
  allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == userId);
  allow create: if isAuthenticated() && (!('role' in request.resource.data) || request.resource.data.role != 'admin' || isAdmin());
  allow update: if isAdmin() || (isAuthenticated() && request.auth.uid == userId && (!('role' in request.resource.data) || request.resource.data.role == resource.data.role || isAdmin()));
  allow delete: if isAdmin();
}
```

---

## 2. Non-Destructive Seeder Defaults

* Both `scripts/seedDatabase.js` and `scripts/seedWithAdminSDK.js` operate in **non-destructive merge mode** (`{ merge: true }`) by default.
* Production enquiries, orders, and customer accounts are **NEVER deleted** during normal seeding.
* To perform a cleanup of tagged test data in an isolated test environment, run:
  ```bash
  node scripts/seedDatabase.js --force-clean-test-data
  ```

---

## 3. Data Integrity & Recovery Strategy

1. **Firestore Export Backup**:
   Prior to applying any production schema migrations, trigger a Google Cloud Firestore export:
   ```bash
   gcloud firestore export gs://vastraa-c7da1-backups/pre-release-backup
   ```
2. **Reconciliation**:
   All 3,252 saree product references across Catalogues A through I remain preserved in `src/data/extractedSarees.json` and `src/data/catalogues.js`.
