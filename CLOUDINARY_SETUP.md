# Panduan Setup dan Deploy Cloudinary

## 📋 Ringkasan Implementasi

Cloudinary telah diimplementasikan untuk:
1. **Gallery Page** - Upload dan penyimpanan foto/video di halaman gallery
2. **Forum Livechat** - Upload foto/video untuk chat di forum

## 🔧 Setup Lokal

### 1. Install Dependencies

Dependencies sudah terinstall:
```bash
npm install cloudinary
```

### 2. Setup Environment Variable

Buat file `.env.local` di root project dengan konten berikut:

```env
CLOUDINARY_URL=cloudinary://474163956845998:7FgKuG5Zd2ScoIx_aaSIp7H8pS8@dwjrcfqy4
```

**Catatan:** File `.env.local` tidak akan di-commit ke git (sudah di-ignore). Pastikan untuk membuat file ini secara manual.

### 3. Verifikasi Konfigurasi

Pastikan `next.config.ts` sudah mengizinkan domain Cloudinary:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    }
  ],
}
```

## 🚀 Deploy ke Production

### Untuk Vercel

1. **Tambahkan Environment Variable:**
   - Buka dashboard Vercel
   - Pilih project Anda
   - Pergi ke Settings > Environment Variables
   - Tambahkan variable baru:
     - **Name:** `CLOUDINARY_URL`
     - **Value:** `cloudinary://474163956845998:7FgKuG5Zd2ScoIx_aaSIp7H8pS8@dwjrcfqy4`
     - **Environment:** Production, Preview, Development (pilih semua)

2. **Redeploy:**
   - Setelah menambahkan environment variable, redeploy aplikasi
   - Vercel akan otomatis menggunakan environment variable baru

### Untuk Netlify

1. **Tambahkan Environment Variable:**
   - Buka dashboard Netlify
   - Pilih site Anda
   - Pergi ke Site settings > Environment variables
   - Klik "Add a variable"
   - Tambahkan:
     - **Key:** `CLOUDINARY_URL`
     - **Value:** `cloudinary://474163956845998:7FgKuG5Zd2ScoIx_aaSIp7H8pS8@dwjrcfqy4`
     - **Scopes:** Semua (Production, Deploy previews, Branch deploys)

2. **Redeploy:**
   - Setelah menambahkan environment variable, trigger deploy baru
   - Atau tunggu automatic deploy jika ada perubahan di git

### Untuk Platform Lain

Tambahkan environment variable `CLOUDINARY_URL` dengan value:
```
cloudinary://474163956845998:7FgKuG5Zd2ScoIx_aaSIp7H8pS8@dwjrcfqy4
```

## 📁 Struktur File yang Diubah

### File Baru:
- `lib/cloudinary.ts` - Utility helper untuk upload/delete ke Cloudinary

### File yang Diupdate:
- `pages/api/media/upload.ts` - Upload media gallery ke Cloudinary
- `pages/api/media/[id].ts` - Delete media dari Cloudinary
- `pages/api/chat/upload-local.ts` - Upload media chat ke Cloudinary
- `models/media.ts` - Menambahkan field `cloudinaryPublicId`
- `next.config.ts` - Menambahkan domain Cloudinary ke remotePatterns

## 🔍 Cara Kerja

### Gallery Upload:
1. User upload file di halaman gallery
2. File di-upload ke Cloudinary dengan folder `gallery`
3. URL Cloudinary disimpan ke MongoDB
4. Public ID disimpan untuk memudahkan delete

### Forum Chat Upload:
1. User upload file di forum livechat
2. File di-upload ke Cloudinary dengan folder `chat-media`
3. URL Cloudinary dikembalikan ke frontend
4. URL digunakan untuk menampilkan media di chat

### Delete Media:
1. Saat user delete media dari gallery
2. File juga dihapus dari Cloudinary menggunakan public ID
3. Data dihapus dari MongoDB

## 🧪 Testing

### Test Lokal:
1. Pastikan file `.env.local` sudah dibuat dengan `CLOUDINARY_URL`
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Test upload di:
   - Gallery page: `/gallery`
   - Forum page: `/forum`

### Test Production:
1. Pastikan environment variable sudah ditambahkan di platform deploy
2. Redeploy aplikasi
3. Test upload di production

## ⚠️ Troubleshooting

### Error: "CLOUDINARY_URL environment variable is not set"
- Pastikan file `.env.local` sudah dibuat di root project
- Pastikan format CLOUDINARY_URL benar: `cloudinary://api_key:api_secret@cloud_name`
- Restart development server setelah membuat/update `.env.local`

### Error: "Invalid CLOUDINARY_URL format"
- Pastikan format URL benar
- Format: `cloudinary://474163956845998:7FgKuG5Zd2ScoIx_aaSIp7H8pS8@dwjrcfqy4`

### Upload Gagal
- Cek koneksi internet
- Cek apakah file size tidak melebihi 100MB
- Cek console untuk error detail
- Pastikan CLOUDINARY_URL sudah benar

### Image tidak muncul di production
- Pastikan `res.cloudinary.com` sudah ditambahkan di `next.config.ts`
- Cek apakah environment variable sudah ditambahkan di platform deploy
- Redeploy aplikasi setelah menambahkan environment variable

## 📝 Catatan Penting

1. **File Size Limit:** Maksimal 100MB per file
2. **Supported Formats:**
   - Images: jpg, jpeg, png, gif, webp, bmp, svg
   - Videos: mp4, webm, ogg, mov, avi, mkv, flv, wmv, m4v
3. **Storage:** File disimpan di Cloudinary, bukan di server lokal
4. **Security:** Jangan commit CLOUDINARY_URL ke git (sudah di-ignore)

## 🔐 Keamanan

- CLOUDINARY_URL berisi credentials sensitif
- Jangan share atau commit ke public repository
- File `.env.local` sudah di-ignore oleh git
- Pastikan environment variable di production platform juga aman

