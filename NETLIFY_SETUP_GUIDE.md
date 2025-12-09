# 🚀 Setup Resend di Netlify - Panduan Langsung

## ✅ API Key Resend Anda
API Key sudah tersedia. Sekarang ikuti langkah-langkah berikut:

---

## 📝 Step-by-Step Setup di Netlify

### **Step 1: Login ke Netlify Dashboard**
1. Buka https://app.netlify.com
2. Login dengan akun Netlify Anda

### **Step 2: Pilih Project**
1. Klik pada project "spartan" atau project Anda
2. Pastikan Anda berada di halaman dashboard project

### **Step 3: Buka Environment Variables**
1. Di sidebar kiri, klik **"Site configuration"** (atau **"Site settings"**)
2. Scroll down dan klik **"Environment variables"**
3. Anda akan melihat daftar environment variables (jika ada)

### **Step 4: Tambahkan Environment Variables**

Klik tombol **"Add a variable"** dan tambahkan 2 variable berikut:

#### **Variable 1: RESEND_API_KEY**
```
Key: RESEND_API_KEY
Value: re_YttEdQVc_Au1SSZE1cFft7b7P349HmWFL
```
- Klik **"Add variable"**

#### **Variable 2: EMAIL_FROM**
```
Key: EMAIL_FROM
Value: onboarding@resend.dev
```
- Klik **"Add variable"**

### **Step 5: Save & Deploy**
1. Pastikan kedua variable sudah ditambahkan
2. Netlify akan otomatis trigger deploy baru
3. Atau klik **"Deploy settings"** → **"Trigger deploy"** → **"Deploy site"**

---

## ✅ Verifikasi Setup

### **Cek Environment Variables:**
1. Kembali ke **"Environment variables"**
2. Pastikan Anda melihat:
   - ✅ `RESEND_API_KEY` = `re_YttEdQVc_...`
   - ✅ `EMAIL_FROM` = `onboarding@resend.dev`

### **Cek Deploy:**
1. Buka tab **"Deploys"**
2. Pastikan deploy terbaru berhasil (status: Published)
3. Jika ada error, cek build logs

---

## 🧪 Testing

### **Test Email Verification:**
1. Buka website yang sudah di-deploy (URL Netlify Anda)
2. Klik **"Register"**
3. Isi form registrasi dengan email Anda yang valid
4. Submit form
5. Anda akan di-redirect ke halaman verifikasi email
6. **Cek email inbox** (atau spam folder)
7. Anda akan menerima email dengan kode 6 digit
8. Input kode di halaman verifikasi
9. Email terverifikasi → redirect ke login

---

## 🔍 Troubleshooting

### **Email tidak terkirim?**
1. **Cek Environment Variables:**
   - Pastikan `RESEND_API_KEY` sudah di-set
   - Pastikan `EMAIL_FROM` sudah di-set

2. **Cek Spam Folder:**
   - Email mungkin masuk ke spam folder
   - Cek juga Promotions tab (Gmail)

3. **Cek Rate Limit:**
   - Resend free tier: 100 emails/hari
   - Jika sudah mencapai limit, tunggu hingga reset

4. **Cek Function Logs:**
   - Buka Netlify Dashboard → **"Functions"** → **"Logs"**
   - Lihat apakah ada error saat mengirim email

### **Kode tidak valid?**
1. **Cek Expiry:** Kode berlaku 10 menit
2. **Cek Format:** Pastikan input 6 digit angka
3. **Request Kode Baru:** Klik "Kirim ulang kode"

### **Error di Build?**
1. **Cek Build Logs:**
   - Buka **"Deploys"** → Klik deploy terbaru → Lihat logs
2. **Cek Dependencies:**
   - Pastikan `resend` package sudah terinstall
   - File `package.json` sudah include `resend`

---

## 📋 Checklist

Sebelum testing, pastikan:
- [ ] API Key Resend sudah ditambahkan di Netlify
- [ ] EMAIL_FROM sudah ditambahkan di Netlify
- [ ] Deploy berhasil tanpa error
- [ ] Website sudah accessible
- [ ] Email yang digunakan untuk test valid

---

## 🎯 Quick Reference

**Environment Variables yang diperlukan:**
```
RESEND_API_KEY=re_YttEdQVc_Au1SSZE1cFft7b7P349HmWFL
EMAIL_FROM=onboarding@resend.dev
```

**URL untuk setup:**
- Netlify Dashboard: https://app.netlify.com
- Resend Dashboard: https://resend.com

---

## ✨ Setelah Setup Berhasil

Setelah environment variables di-set dan deploy berhasil:
1. ✅ Sistem verifikasi email sudah aktif
2. ✅ Setiap user yang register dengan email akan menerima kode OTP
3. ✅ User harus verifikasi email sebelum bisa login
4. ✅ Kode OTP berlaku 10 menit

---

**Selamat! Sistem verifikasi email Anda sudah siap digunakan! 🎉**

Jika ada masalah, cek Function Logs di Netlify atau hubungi support.

