# 📖 VASTRAA — OPERATIONS & DEPLOYMENT RUNBOOK

**Repository**: `https://github.com/lakshmistoresonline-afk/VASTRAA.git`  
**Branch**: `fix/recursive-production-readiness`  
**Firebase Project**: `vastraa-c7da1`

---

## 1. Staging Deployment Execution Protocol

To deploy the tested assets from branch `fix/recursive-production-readiness` to Firebase Staging:

1. **Verify Clean Working Tree**:
   ```bash
   git status
   ```
2. **Execute Full Test & Build Suite**:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
3. **Deploy to Firebase Hosting (When Authorized)**:
   ```bash
   npx firebase deploy --only hosting --project vastraa-c7da1
   ```

---

## 2. Emergency Rollback Procedure

If a deployed hosting release needs to be rolled back:

1. Open Firebase Console ➔ Hosting ➔ **`vastraa-c7da1`**.
2. Select the previous verified release tag from the **Release History** list.
3. Click **Rollback** to instantly restore the previous hosting build.
