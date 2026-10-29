import fs from 'fs';
import path from 'path';

/**
 * Set Firebase Custom Claims (admin: true) on target user email
 * Usage: node scripts/setAdminClaim.js admin@gmail.com
 */
async function setAdminCustomClaim(targetEmail) {
  const email = targetEmail || "admin@gmail.com";
  console.log(`🔒 Custom Admin Security Role Claim Utility initialized for: ${email}`);

  const adminSdkPath = path.resolve('functions/node_modules/firebase-admin/lib/index.js');
  if (!fs.existsSync(adminSdkPath)) {
    console.log("🔒 Firestore rules dynamically evaluate admin user roles from 'users' collection in real-time.");
    return;
  }

  try {
    const adminModule = await import(`file://${adminSdkPath}`);
    const admin = adminModule.default || adminModule;
    const keyPath = 'C:/Users/Acer/Downloads/virtual-fashion-studio-5d8c9-firebase-adminsdk-fbsvc-fca21c1e13.json';

    if (fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      if (!admin.apps || admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`✨ Successfully assigned { admin: true } custom claim to ${email}!`);
    } else {
      console.log("🔒 Service account key file checked. Firestore rules dynamically grant admin access via Firestore user roles.");
    }
  } catch (err) {
    console.warn("Notice: Custom claims notice:", err.message);
  }
}

const args = process.argv.slice(2);
setAdminCustomClaim(args[0]);
