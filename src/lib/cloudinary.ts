import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Konfigurasi Cloudinary dari CLOUDINARY_URL
// Format: cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
  const urlMatch = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    const [, apiKey, apiSecret, cloudName] = urlMatch;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log('Cloudinary configured successfully');
  } else {
    console.error('Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
  }
} else {
  console.warn('CLOUDINARY_URL environment variable is not set');
}

/**
 * Upload file buffer ke Cloudinary
 * @param buffer - File buffer yang akan diupload
 * @param folder - Folder di Cloudinary (default: 'gallery' atau 'chat-media')
 * @param resourceType - 'image' atau 'video'
 * @param publicId - Optional public ID untuk file
 * @returns Promise dengan URL hasil upload
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'gallery',
  resourceType: 'image' | 'video' | 'auto' = 'auto',
  publicId?: string
): Promise<{ url: string; publicId: string; secureUrl: string }> {
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_URL environment variable.');
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType === 'auto' ? 'auto' : resourceType,
          public_id: publicId,
          overwrite: false,
          invalidate: true,
          chunk_size: 6000000, // 6MB chunks for large files (5MB files will use 1 chunk)
          timeout: 120000, // 120 seconds timeout for large files
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name
            });
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (result) {
            resolve({
              url: result.url,
              publicId: result.public_id,
              secureUrl: result.secure_url,
            });
          } else {
            reject(new Error('Upload failed: No result returned from Cloudinary'));
          }
        }
      );

      // Convert buffer ke stream
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
      
      // Handle stream errors
      readable.on('error', (err) => {
        console.error('Stream error:', err);
        reject(new Error(`Stream error: ${err.message}`));
      });
      
      uploadStream.on('error', (err) => {
        console.error('Upload stream error:', err);
        reject(new Error(`Upload stream error: ${err.message}`));
      });
    } catch (err: any) {
      console.error('Error setting up Cloudinary upload:', err);
      reject(new Error(`Failed to setup upload: ${err.message}`));
    }
  });
}

/**
 * Upload file dari filepath ke Cloudinary
 * @param filepath - Path ke file yang akan diupload
 * @param folder - Folder di Cloudinary
 * @param resourceType - 'image' atau 'video'
 * @returns Promise dengan URL hasil upload
 */
export async function uploadFileToCloudinary(
  filepath: string,
  folder: string = 'gallery',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<{ url: string; publicId: string; secureUrl: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filepath,
      {
        folder,
        resource_type: resourceType === 'auto' ? 'auto' : resourceType,
        overwrite: false,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );
  });
}

/**
 * Hapus file dari Cloudinary berdasarkan public ID
 * @param publicId - Public ID dari file yang akan dihapus
 * @param resourceType - 'image' atau 'video'
 * @returns Promise dengan hasil delete
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ result: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary delete error:', error);
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Delete failed: No result returned'));
        }
      }
    );
  });
}

/**
 * Extract public ID dari Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID atau null
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Format Cloudinary URL: 
    // https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{folder}/{public_id}.{ext}
    // atau: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{folder}/{public_id}.{ext}
    
    // Cari bagian setelah /upload/
    const uploadMatch = url.match(/\/upload\/(.+)/);
    if (!uploadMatch) {
      return null;
    }
    
    const afterUpload = uploadMatch[1];
    
    // Split by '/' dan ambil bagian terakhir (public_id dengan extension)
    const parts = afterUpload.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Hapus extension (semua setelah titik terakhir)
    const publicIdWithFolder = lastPart.replace(/\.[^.]*$/, '');
    
    // Jika ada folder, gabungkan dengan folder
    if (parts.length > 1) {
      const folder = parts.slice(0, -1).join('/');
      return `${folder}/${publicIdWithFolder}`;
    }
    
    return publicIdWithFolder;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

