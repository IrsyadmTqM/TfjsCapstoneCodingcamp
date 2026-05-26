# ♻️ AI Deteksi Sampah - Model Integration Guide

Dokumentasi ini ditujukan untuk mempermudah integrasi model Machine Learning (**TensorFlow.js**) pendeteksi jenis sampah ke dalam aplikasi web (React.js maupun Vanilla JS).

Model ini menggunakan **Binary Classification** untuk mendeteksi dua kategori utama:
1.  **Botol Plastik** (Anorganik)
2.  **Sisa Makanan** (Organik)

---

## 📂 Struktur Project

Pastikan file model ditempatkan dengan benar agar dapat diakses oleh browser:

```text
your-project/
├── public/ (atau root folder)
│   └── model/
│       ├── model.json           <-- File arsitektur model
│       └── group1-shard1of1.bin <-- File bobot (weights)
├── src/ (untuk React)
│   └── hooks/
│       └── useDeteksiSampah.js  <-- Custom Hook
├── index.html                   <-- Contoh implementasi Vanilla JS
└── script.js                    <-- Logika Vanilla JS
```

---

## 🚀 Panduan Integrasi - React.js

### 1. Instalasi
Install library TensorFlow.js di project React kamu:
```bash
npm install @tensorflow/tfjs
```

### 2. Penggunaan Custom Hook
Gunakan `useDeteksiSampah.js` yang sudah membungkus logika kompleks seperti *Memory Management GPU*, *Preprocessing Tensor*, dan *Normalisasi*.

**Nilai yang dikembalikan:**
- `isReady`: `true` jika model sudah terunduh.
- `statusText`: Pesan status (misal: "Model Siap!").
- `isPredicting`: `true` saat AI sedang bekerja.
- `hasil`: Objek berisi `label` dan `confidence`.
- `prediksi(imgElement)`: Fungsi untuk menjalankan deteksi pada elemen gambar.
- `resetHasil()`: Menghapus hasil prediksi sebelumnya.

### 3. Contoh Implementasi
```javascript
import { useRef } from 'react';
import { useDeteksiSampah } from './hooks/useDeteksiSampah';

const App = () => {
  const { isReady, statusText, isPredicting, hasil, prediksi } = useDeteksiSampah();
  const imgRef = useRef();

  return (
    <div>
      <h2>{statusText}</h2>
      <input type="file" onChange={(e) => {
        imgRef.current.src = URL.createObjectURL(e.target.files[0]);
      }} disabled={!isReady} />
      
      <img ref={imgRef} onLoad={() => prediksi(imgRef.current)} style={{ display: 'none' }} />

      {isPredicting && <p>Menganalisis...</p>}
      {hasil && <p>Hasil: {hasil.label} ({hasil.confidence}%)</p>}
    </div>
  );
};
```

---

## 📜 Panduan Integrasi - Vanilla JS

Untuk penggunaan tanpa framework, Anda bisa langsung menggunakan `script.js`.

### 1. Load Script
Pastikan library TensorFlow.js sudah di-load di `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
<script src="script.js"></script>
```

### 2. Fungsi Utama
Panggil `loadModel()` saat inisialisasi dan `predictImage(imgElement)` untuk mendeteksi gambar.

---

## 🛠️ Catatan Teknis

- **Preprocessing:** Gambar otomatis di-resize ke `224x224` piksel.
- **Normalization:** Nilai piksel dikonversi ke rentang `[-1.0, 1.0]` sesuai standar MobileNetV2.
- **Memory Management:** Menggunakan `tf.tidy()` untuk mencegah kebocoran memori pada GPU/VRAM.
- **Channel:** Hanya menggunakan 3 channel warna (RGB), membuang Alpha channel jika ada.

---
*Dibuat untuk mempermudah transisi dari Model ML ke Production UI.*
