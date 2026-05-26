# ♻️ AI Deteksi Sampah - Panduan Integrasi (React & Vanilla JS)

Dokumentasi ini dirancang untuk memudahkan integrasi model Machine Learning (TensorFlow.js) ke dalam proyek web. Model ini dilatih untuk mendeteksi dua jenis sampah:
1. Botol Plastik (Sampah Anorganik)
2. Sisa Makanan (Sampah Organik)

---

## 📂 1. Persiapan File Model AI

Langkah pertama adalah menyiapkan file model yang telah diberikan oleh tim Machine Learning. Model ini biasanya terdiri dari:
- model.json: Struktur arsitektur model.
- group1-shard1of1.bin (atau file serupa): Bobot model.

### Penempatan File:
Salin folder model/ ke direktori publik proyek Anda agar dapat diakses oleh browser:
- React.js: Masukkan ke folder public/.
- Vanilla JS: Masukkan ke root folder (sejajar dengan index.html).

**Struktur Folder yang Direkomendasikan:**
`	ext
📂 nama-project/
├── 📂 public/ (atau root folder)
│   └── 📂 model/
│       ├── model.json
│       └── group1-shard1of1.bin
`

---

## 🚀 2. Implementasi di React.js

### Langkah 1: Instalasi Library
Jalankan perintah berikut di terminal proyek React Anda:
`ash
npm install @tensorflow/tfjs
`

### Langkah 2: Setup Custom Hook
Gunakan file useDeteksiSampah.js dan letakkan di dalam folder src/hooks/. File ini menangani manajemen memori (GPU) dan pemrosesan gambar secara otomatis.

### Langkah 3: Penggunaan di Komponen
Berikut adalah contoh implementasi pada komponen UI:

`javascript
import React, { useRef } from 'react';
import { useDeteksiSampah } from './hooks/useDeteksiSampah';

const App = () => {
  const { isReady, statusText, isPredicting, hasil, prediksi } = useDeteksiSampah();
  const imgRef = useRef();

  const handlePilihGambar = (e) => {
    const file = e.target.files[0];
    if (file) {
      imgRef.current.src = URL.createObjectURL(file);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Detektor Sampah AI</h1>
      <p>Status: <strong>{statusText}</strong></p>
      
      <input 
        type="file" 
        onChange={handlePilihGambar} 
        disabled={!isReady} 
        accept="image/*"
      />
      
      <div style={{ marginTop: '20px' }}>
        <img 
          ref={imgRef} 
          onLoad={() => prediksi(imgRef.current)} 
          style={{ maxWidth: '300px', display: imgRef.current?.src ? 'block' : 'none' }} 
          alt="Pratinjau Sampah"
        />
      </div>

      {isPredicting && <p style={{ color: 'blue' }}>Menganalisis gambar...</p>}
      
      {hasil && (
        <div style={{ marginTop: '15px', padding: '15px', background: '#d1fae5', borderRadius: '8px' }}>
          <p><strong>Hasil:</strong> {hasil.label}</p>
          <p><strong>Akurasi:</strong> {hasil.confidence}%</p>
        </div>
      )}
    </div>
  );
};

export default App;
`

---

## 📜 3. Implementasi di Vanilla JS (HTML Biasa)

Jika Anda tidak menggunakan framework, Anda bisa menggunakan CDN.

### Langkah 1: Setup index.html
`html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deteksi Sampah AI</title>
    <!-- TensorFlow.js Library -->
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
</head>
<body>
    <h2>Status AI: <span id="status">Memuat Model...</span></h2>
    
    <input type="file" id="uploadInput" accept="image/*">
    <br><br>
    <img id="gambarPreview" style="display:none; max-width: 300px;">
    
    <div id="containerHasil" style="display:none; margin-top: 15px; padding: 15px; background: #eee;">
        <p id="labelHasil"></p>
        <p id="confidenceHasil"></p>
    </div>

    <script src="script.js"></script>
</body>
</html>
`

---

## 🛠️ 4. Detail Teknis (Otomatis)

Tim pengembang tidak perlu khawatir tentang detail berikut, karena sudah ditangani oleh sistem:
- **Auto-Resize**: Gambar diubah menjadi **224x224** piksel secara otomatis.
- **Normalisasi**: Nilai piksel dikonversi ke skala **-1.0 hingga 1.0**.
- **Manajemen Memori**: Menggunakan tf.tidy() untuk mencegah kebocoran memori (memory leak) pada browser agar tetap ringan.
