# 📧 Setup Email Verification (OTP) untuk Netlify

## 📋 Penjelasan Sistem OTP

Sistem verifikasi email yang sudah dibuat menggunakan **One-Time Password (OTP)** dengan fitur:

1. **Generate Kode**: Kode 6 digit di-generate secara random
2. **Kirim Email**: Kode dikirim ke email user yang didaftarkan
3. **Validasi**: User input kode untuk verifikasi
4. **Expiry**: Kode berlaku selama 10 menit
5. **Auto-Delete**: Kode lama otomatis dihapus saat request kode baru

### Flow Verifikasi:
```
User Register → Kode OTP Dikirim → User Input Kode → Email Terverifikasi → Redirect ke Login
```

---

## 🆓 Pilihan Service Email Gratis

### **Opsi 1: Resend (RECOMMENDED) ⭐**
- ✅ **Gratis**: 3,000 emails/bulan, 100 emails/hari
- ✅ **Mudah Setup**: Hanya perlu API key
- ✅ **No Credit Card**: Tidak perlu kartu kredit
- ✅ **Reliable**: Service modern dan cepat

### **Opsi 2: Gmail dengan App Password**
- ✅ **Gratis**: Unlimited (dengan limit harian)
- ✅ **Mudah**: Jika sudah punya Gmail
- ⚠️ **Perlu Setup**: Harus enable 2FA dan buat App Password

### **Opsi 3: SendGrid**
- ✅ **Gratis**: 100 emails/hari
- ⚠️ **Perlu Verifikasi**: Perlu verifikasi identitas

---

## 🚀 Implementasi ke Netlify (Menggunakan Resend)

### **Step 1: Daftar Resend (Gratis)**

1. Buka https://resend.com
2. Klik **"Sign Up"** (bisa pakai GitHub/Google)
3. Verifikasi email Anda
4. Setelah login, buka **"API Keys"** di sidebar
5. Klik **"Create API Key"**
6. Beri nama: `spartan-verification`
7. Copy API key yang muncul (hanya muncul sekali!)

### **Step 2: Update Kode untuk Menggunakan Resend**

File `src/pages/api/auth/send-verification.ts` sudah siap, hanya perlu update konfigurasi.

### **Step 3: Setup Environment Variables di Netlify**

1. Login ke Netlify Dashboard
2. Pilih project Anda
3. Buka **"Site configuration"** → **"Environment variables"**
4. Tambahkan variable berikut:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

**Catatan**: 
- `RESEND_API_KEY`: API key dari Resend (Step 1)
- `EMAIL_FROM`: Email pengirim (bisa pakai domain Resend atau domain Anda sendiri)

### **Step 4: Update API untuk Menggunakan Resend**

Kode sudah siap, hanya perlu install package Resend.

---

## 📝 Setup Lengkap dengan Resend

### **1. Install Resend Package**

```bash
npm install resend
```

### **2. Update API Send Verification**

File sudah diupdate untuk support Resend. Pastikan menggunakan Resend API.

### **3. Environment Variables di Netlify**

Tambahkan di Netlify Environment Variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

**Note**: 
- `onboarding@resend.dev` adalah email default Resend untuk testing
- Untuk production, gunakan domain verified Anda

---

## 🔧 Alternatif: Menggunakan Gmail (Gratis)

Jika Anda ingin menggunakan Gmail:

### **Step 1: Enable 2FA di Gmail**

1. Buka https://myaccount.google.com/security
2. Aktifkan **"2-Step Verification"**
3. Ikuti instruksi untuk setup

### **Step 2: Buat App Password**

1. Setelah 2FA aktif, buka **"App passwords"**
2. Pilih app: **"Mail"**
3. Pilih device: **"Other (Custom name)"**
4. Ketik: `Spartan App`
5. Klik **"Generate"**
6. **Copy password** yang muncul (16 karakter)

### **Step 3: Setup di Netlify**

Tambahkan Environment Variables di Netlify:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=your-email@gmail.com
```

**Note**: Password adalah App Password (16 karakter dengan spasi, bisa pakai dengan atau tanpa spasi)

---

## ✅ Testing

### **Test di Development (Local)**

1. Buat file `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

2. Run development server:
```bash
npm run dev
```

3. Test register dengan email → cek email inbox

### **Test di Production (Netlify)**

1. Deploy ke Netlify
2. Pastikan Environment Variables sudah di-set
3. Test register dengan email
4. Cek email inbox (atau spam folder)

---

## 🐛 Troubleshooting

### **Email tidak terkirim?**

1. **Cek Environment Variables**: Pastikan sudah di-set di Netlify
2. **Cek Logs**: Buka Netlify Functions logs untuk melihat error
3. **Cek Spam Folder**: Email mungkin masuk ke spam
4. **Cek Rate Limit**: Resend free tier: 100 emails/hari

### **Kode tidak valid?**

1. **Cek Expiry**: Kode berlaku 10 menit
2. **Cek Format**: Pastikan input 6 digit angka
3. **Request Kode Baru**: Klik "Kirim ulang kode"

### **Error di Netlify?**

1. **Cek Build Logs**: Pastikan build berhasil
2. **Cek Function Logs**: Lihat error di Netlify Functions
3. **Cek Environment Variables**: Pastikan semua variable sudah di-set

---

## 📚 Dokumentasi Tambahan

- **Resend Docs**: https://resend.com/docs
- **Gmail App Password**: https://support.google.com/accounts/answer/185833
- **Netlify Environment Variables**: https://docs.netlify.com/environment-variables/overview/

---

## 🎯 Quick Start (Resend)

1. Daftar Resend → Dapatkan API Key
2. Install: `npm install resend`
3. Set Environment Variables di Netlify:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
4. Deploy → Test!

---

**Selamat! Sistem verifikasi email Anda siap digunakan! 🎉**

