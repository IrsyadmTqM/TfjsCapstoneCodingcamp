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
```

### Langkah 2: Logika di `script.js`
Pastikan logika pemrosesan gambar (resize, normalisasi) sesuai dengan standar model yang ada di `useDeteksiSampah.js`.

---

## 4. Detail Teknis

(Informasi ini sudah ditangani otomatis oleh sistem)

### Proses Otomatis:
- **Auto-Resize**: Gambar diubah menjadi 224x224 piksel
- **Normalisasi**: Nilai piksel dikonversi ke skala -1.0 hingga 1.0
- **Manajemen Memori**: Menggunakan `tf.tidy()` untuk mencegah memory leak pada browser
