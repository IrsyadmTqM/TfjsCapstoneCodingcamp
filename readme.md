# AI Deteksi Sampah - Panduan Integrasi

Dokumentasi lengkap untuk integrasi model Machine Learning (**TensorFlow.js**) ke dalam proyek web.

Model dapat mendeteksi:
- **Botol Plastik** (Sampah Anorganik)
- **Sisa Makanan** (Sampah Organik)

---

## 1. Persiapan File Model AI

Langkah pertama adalah menyiapkan file model dari tim Machine Learning. File model biasanya terdiri dari:
- `model.json` - Struktur arsitektur model
- `group1-shard1of3.bin`, `group1-shard2of3.bin`, `group1-shard3of3.bin` - File bobot model (dapat berjumlah multiple shards)

### Penempatan File

Salin folder `model/` ke direktori publik proyek Anda agar dapat diakses oleh browser:
- **React.js**: Masukkan ke folder `public/`
- **Vanilla JS**: Masukkan ke root folder (sejajar dengan `index.html`)

**Struktur folder yang direkomendasikan:**

```
nama-project/
├── public/ (atau root folder)
│   └── model/
│       ├── model.json
│       ├── group1-shard1of3.bin
│       ├── group1-shard2of3.bin
│       └── group1-shard3of3.bin
```

---

## 2. Implementasi di React.js

### Langkah 1: Instalasi Library
Jalankan perintah berikut di terminal proyek React Anda:
```bash
npm install @tensorflow/tfjs
```

### Langkah 2: Setup Custom Hook
Gunakan file `useDeteksiSampah.js` dan letakkan di dalam folder `src/hooks/`. File ini menangani manajemen memori (GPU) dan pemrosesan gambar secara otomatis.

### Langkah 3: Penggunaan di Komponen
Berikut adalah contoh implementasi pada komponen UI:

```javascript
import React, { useRef, useState } from 'react';
import { useDeteksiSampah } from './hooks/useDeteksiSampah';

const App = () => {
  const { isReady, statusText, isPredicting, hasil, prediksi, resetHasil } = useDeteksiSampah();
  const imgRef = useRef();
  const [showImage, setShowImage] = useState(false);

  const handlePilihGambar = (e) => {
    const file = e.target.files[0];
    if (file) {
      imgRef.current.src = URL.createObjectURL(file);
      setShowImage(true);
      resetHasil();
    }
  };

  const handleReset = () => {
    imgRef.current.src = '';
    setShowImage(false);
    resetHasil();
  };

  return (
    <div>
      <h1>Detektor Sampah AI</h1>
      <p>Status: <strong>{statusText}</strong></p>
      
      <input 
        type="file" 
        onChange={handlePilihGambar} 
        disabled={!isReady} 
        accept="image/*"
      />
      
      {showImage && (
        <div>
          <img 
            ref={imgRef} 
            onLoad={() => prediksi(imgRef.current)} 
            alt="Pratinjau Sampah"
          />
        </div>
      )}

      {isPredicting && <p>Menganalisis gambar...</p>}
      
      {hasil && (
        <div>
          <p><strong>Hasil Deteksi:</strong> {hasil.label}</p>
          <p><strong>Akurasi:</strong> {hasil.confidence}%</p>
          <button onClick={handleReset}>
            Coba Gambar Lain
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
```

---

## 3. Implementasi di Vanilla JS

Jika Anda tidak menggunakan framework, Anda bisa menggunakan CDN.

### Langkah 1: Setup `index.html`
```html
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
    <h1>Detektor Sampah AI</h1>
    <h3>Status AI: <span id="status">Memuat Model...</span></h3>
    
    <input type="file" id="uploadInput" accept="image/*" disabled>
    <br><br>
    <img id="gambarPreview" style="display:none;">
    
    <p id="loadingText" style="display:none;">Menganalisis gambar...</p>
    
    <div id="containerHasil" style="display:none;">
        <p><strong>Hasil Deteksi:</strong> <span id="labelHasil"></span></p>
        <p><strong>Akurasi:</strong> <span id="confidenceHasil"></span>%</p>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### Langkah 2: Setup File `script.js`
Salin file `script.js` dari repo ini dan letakkan di folder yang sama dengan `index.html`:

**Struktur folder:**
```
project-folder/
├── index.html
├── script.js          ← Copy file ini dari repo
└── model/
    ├── model.json
    ├── group1-shard1of3.bin
    ├── group1-shard2of3.bin
    └── group1-shard3of3.bin
```

File `script.js` sudah berisi semua logika yang diperlukan:
- ✅ Load model otomatis saat halaman dibuka
- ✅ Handle file upload dan preview gambar
- ✅ Resize gambar ke 224x224 piksel
- ✅ Normalisasi pixel dengan skala -1.0 hingga 1.0
- ✅ Prediksi menggunakan model
- ✅ Tampilkan hasil dengan akurasi

Tidak perlu memodifikasi apapun dari `script.js`, langsung bisa digunakan!

---

## 4. Detail Teknis

(Informasi ini sudah ditangani otomatis oleh sistem)

### Proses Otomatis:
- **Auto-Resize**: Gambar diubah menjadi 224x224 piksel
- **Normalisasi**: Nilai piksel dikonversi ke skala -1.0 hingga 1.0
- **Manajemen Memori**: Menggunakan `tf.tidy()` untuk mencegah memory leak pada browser
