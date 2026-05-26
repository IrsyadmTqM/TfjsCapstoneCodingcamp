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
      resetHasil(); // Reset hasil sebelumnya
    }
  };

  const handleReset = () => {
    imgRef.current.src = '';
    setShowImage(false);
    resetHasil();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1>🗑️ Detektor Sampah AI</h1>
      
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <p>Status: <strong style={{ color: isReady ? '#10b981' : '#0066cc' }}>{statusText}</strong></p>
      </div>
      
      <input 
        type="file" 
        onChange={handlePilihGambar} 
        disabled={!isReady} 
        accept="image/*"
        style={{ padding: '10px', cursor: isReady ? 'pointer' : 'not-allowed' }}
      />
      
      {showImage && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <img 
            ref={imgRef} 
            onLoad={() => prediksi(imgRef.current)} 
            style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: '8px', border: '2px solid #ddd' }} 
            alt="Pratinjau Sampah"
          />
        </div>
      )}

      {isPredicting && (
        <p style={{ marginTop: '15px', color: '#0066cc', fontStyle: 'italic', textAlign: 'center' }}>
          ⏳ Menganalisis gambar...
        </p>
      )}
      
      {hasil && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          background: '#d1fae5', 
          borderRadius: '8px', 
          borderLeft: '4px solid #10b981',
          textAlign: 'center'
        }}>
          <p><strong>Hasil Deteksi:</strong> {hasil.label}</p>
          <p><strong>Akurasi:</strong> {hasil.confidence}%</p>
          <button 
            onClick={handleReset}
            style={{ 
              marginTop: '10px', 
              padding: '8px 16px', 
              background: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
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
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
        }
        .container {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
        #status {
            font-weight: bold;
            color: #0066cc;
        }
        #uploadInput {
            padding: 10px;
            margin-top: 10px;
        }
        #gambarPreview {
            margin-top: 15px;
            max-width: 300px;
            border-radius: 8px;
            border: 2px solid #ddd;
        }
        #containerHasil {
            margin-top: 15px;
            padding: 15px;
            background: #d1fae5;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        .loading {
            color: #0066cc;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗑️ Detektor Sampah AI</h1>
        <h3>Status AI: <span id="status">Memuat Model...</span></h3>
        
        <input type="file" id="uploadInput" accept="image/*" disabled>
        <br><br>
        <img id="gambarPreview" style="display:none;">
        
        <p id="loadingText" class="loading" style="display:none;">Menganalisis gambar...</p>
        
        <div id="containerHasil" style="display:none;">
            <p><strong>Hasil Deteksi:</strong> <span id="labelHasil"></span></p>
            <p><strong>Akurasi:</strong> <span id="confidenceHasil"></span>%</p>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### Langkah 2: Logika di `script.js`
Buat file `script.js` dengan kode berikut:

```javascript
// Konstanta Label
const LABELS = ["Botol Plastik (Anorganik)", "Sisa Makanan (Organik)"];
const MODEL_URL = '/model/model.json';

// Elemen DOM
const statusEl = document.getElementById('status');
const uploadInput = document.getElementById('uploadInput');
const gambarPreview = document.getElementById('gambarPreview');
const containerHasil = document.getElementById('containerHasil');
const labelHasil = document.getElementById('labelHasil');
const confidenceHasil = document.getElementById('confidenceHasil');
const loadingText = document.getElementById('loadingText');

let model = null;

// =====================
// 1. LOAD MODEL
// =====================
async function loadModel() {
  try {
    model = await tf.loadGraphModel(MODEL_URL);
    statusEl.textContent = 'Model Siap!';
    statusEl.style.color = '#10b981';
    uploadInput.disabled = false;
  } catch (error) {
    statusEl.textContent = 'Gagal memuat model!';
    statusEl.style.color = '#dc2626';
    console.error('Error loading model:', error);
  }
}

// =====================
// 2. HANDLE FILE UPLOAD
// =====================
uploadInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    gambarPreview.src = event.target.result;
    gambarPreview.style.display = 'block';
    containerHasil.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

// =====================
// 3. PREDICT WHEN IMAGE LOADED
// =====================
gambarPreview.addEventListener('load', async function() {
  if (!model) return;
  
  loadingText.style.display = 'block';
  containerHasil.style.display = 'none';

  try {
    const hasil = await prediksiGambar(gambarPreview);
    
    if (hasil) {
      labelHasil.textContent = hasil.label;
      confidenceHasil.textContent = hasil.confidence;
      containerHasil.style.display = 'block';
    }
  } catch (error) {
    console.error('Error predicting:', error);
    labelHasil.textContent = 'Terjadi kesalahan!';
  } finally {
    loadingText.style.display = 'none';
  }
});

// =====================
// 4. PREDIKSI FUNCTION
// =====================
async function prediksiGambar(imageElement) {
  if (!model) return null;

  return tf.tidy(() => {
    // 1. Convert pixel ke tensor
    let rawTensor = tf.browser.fromPixels(imageElement, 3);
    
    // 2. Resize ke 224x224
    let resizedTensor = tf.image.resizeBilinear(rawTensor, [224, 224]);
    
    // 3. Konversi ke float dan tambah batch dimension
    let floatedTensor = resizedTensor.toFloat().expandDims(0);
    
    // 4. Normalisasi: (pixel / 127.5) - 1.0
    let normalizedTensor = floatedTensor.div(tf.scalar(127.5)).sub(tf.scalar(1.0));

    // 5. Prediksi
    const output = model.predict(normalizedTensor);
    const score = output.dataSync()[0];
    
    // 6. Parse hasil
    let label = score < 0.5 ? LABELS[0] : LABELS[1];
    let confidence = score < 0.5 ? (1.0 - score) * 100 : score * 100;

    return {
      label: label,
      confidence: confidence.toFixed(1),
      rawScore: score
    };
  });
}

// =====================
// 5. LOAD MODEL SAAT HALAMAN SIAP
// =====================
document.addEventListener('DOMContentLoaded', loadModel);
```

---

## 4. Detail Teknis

(Informasi ini sudah ditangani otomatis oleh sistem)

### Proses Otomatis:
- **Auto-Resize**: Gambar diubah menjadi 224x224 piksel
- **Normalisasi**: Nilai piksel dikonversi ke skala -1.0 hingga 1.0
- **Manajemen Memori**: Menggunakan `tf.tidy()` untuk mencegah memory leak pada browser
