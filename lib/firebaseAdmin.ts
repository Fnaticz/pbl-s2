import * as admin from "firebase-admin";

let adminStorage: any = null;

function initializeAdmin() {
  if (!admin.apps.length) {
    // Validasi environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    // Validasi semua env vars ada
    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
      const missing = [];
      if (!projectId) missing.push("FIREBASE_PROJECT_ID");
      if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
      if (!storageBucket) missing.push("FIREBASE_STORAGE_BUCKET");
      
      const errorMsg = `Missing required environment variables: ${missing.join(", ")}`;
      console.error("Firebase Admin Error:", errorMsg);
      throw new Error(errorMsg);
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
        storageBucket: storageBucket,
      });
      console.log("Firebase Admin initialized successfully");
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error?.message);
      throw error;
    }
  }

  if (!adminStorage) {
    adminStorage = admin.storage().bucket();
  }
  
  return adminStorage;
}

// Lazy initialization - hanya initialize saat dipanggil
export function getAdminStorage() {
  return initializeAdmin();
}

// Export untuk backward compatibility
try {
  adminStorage = initializeAdmin();
} catch (error) {
  // Biarkan error terjadi saat import, akan di-handle di handler
  console.warn("Firebase Admin not initialized at module load:", error);
}

export { adminStorage };
