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
