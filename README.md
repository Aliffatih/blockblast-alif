# Block Blast Master - Deployment Guide

Aplikasi ini dibangun menggunakan React + Vite + Tailwind CSS. Berikut adalah panduan untuk mengaksesnya di Google Chrome (via GitHub) dan Acode di Android.

## 1. Cara Upload ke GitHub
1. Buat repository baru di [GitHub](https://github.com/new).
2. Di terminal komputer Anda (atau di Acode terminal), jalankan perintah berikut:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA_REPO.git
   git push -u origin main
   ```

## 2. Cara Akses di Google Chrome (Hosting)
Agar bisa dibuka di Chrome lewat URL, Anda bisa menggunakan **GitHub Pages** atau **Vercel**:

### Menggunakan Vercel (Direkomendasikan)
1. Login ke [Vercel](https://vercel.com).
2. Klik "Add New" -> "Project".
3. Import repository GitHub Anda.
4. Klik "Deploy". Vercel akan memberikan URL otomatis (misal: `block-blast.vercel.app`).

### Menggunakan GitHub Pages
1. Install package gh-pages: `npm install gh-pages --save-dev`.
2. Tambahkan `"homepage": "https://username.github.io/repo-name"` di `package.json`.
3. Tambahkan script deploy di `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Jalankan `npm run deploy`.

## 3. Cara Akses di Acode (Android)
Aplikasi ini dapat dikelola sepenuhnya melalui **Acode** di Android:

### Langkah-langkah:
1. **Buka Project**: 
   * Download project ini sebagai ZIP atau clone menggunakan plugin Git di Acode.
   * Ekstrak dan buka folder project melalui menu **Open Folder** di Acode.
2. **Edit Coding**: 
   * Anda bisa mengedit file `.tsx` dan `.css` langsung di Acode dengan dukungan syntax highlighting yang lengkap.
3. **Preview Tanpa Terminal**:
   * Karena ini adalah project React (Vite), Anda tidak bisa langsung klik "Live Preview" pada file source.
   * **Solusi**: Gunakan layanan **Vercel** atau **GitHub Pages** (seperti di poin 2). Setelah di-deploy, Anda cukup membuka URL tersebut di browser Chrome Android sambil tetap mengedit kodenya di Acode.
4. **Sinkronisasi**:
   * Gunakan plugin **Git** di Acode untuk melakukan `push` perubahan kode ke GitHub. Vercel akan otomatis mengupdate tampilan di Chrome setiap kali Anda melakukan push.

## 4. Konfigurasi Penting
Pastikan file `vite.config.ts` sudah benar. Jika menggunakan GitHub Pages dengan sub-folder, tambahkan `base: '/nama-repo/'` di `defineConfig`.
