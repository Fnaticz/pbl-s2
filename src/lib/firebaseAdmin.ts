import * as admin from "firebase-admin";

let adminStorage: any = null;

async function initializeAdmin() {
  // Validasi environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!admin.apps.length) {
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
      console.log("Firebase Admin initialized successfully with bucket:", storageBucket);
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error?.message);
      throw error;
    }
  }

  if (!adminStorage) {
    // Coba gunakan default bucket dari app config dulu
    const app = admin.app();
    const defaultBucket = app.options.storageBucket;
    
    // Gunakan bucket name secara eksplisit, atau fallback ke default
    const bucketName = storageBucket || defaultBucket || process.env.FIREBASE_STORAGE_BUCKET;
    
    if (!bucketName) {
      throw new Error("Storage bucket name is not configured");
    }
    
    console.log("Initializing storage bucket:", bucketName);
    console.log("Default bucket from app:", defaultBucket);
    console.log("Env var bucket:", process.env.FIREBASE_STORAGE_BUCKET);
    
    adminStorage = admin.storage().bucket(bucketName);
    
    // Test bucket access
    try {
      const [exists] = await adminStorage.exists();
      if (!exists) {
        console.warn(`Bucket ${bucketName} does not exist or is not accessible`);
      } else {
        console.log(`Bucket ${bucketName} exists and is accessible`);
      }
    } catch (testError: any) {
      console.warn(`Could not verify bucket access:`, testError?.message);
    }
  }
  
  return adminStorage;
}

// Lazy initialization - hanya initialize saat dipanggil
export async function getAdminStorage() {
  return await initializeAdmin();
}

// Export untuk backward compatibility - initialize saat module load (tanpa await)
// Akan di-handle di handler dengan getAdminStorage()

export { adminStorage };
