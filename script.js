// 1. Inisialisasi Label sesuai urutan alfabetis folder dataset kamu
const LABELS = ["Botol Plastik (Anorganik)", "Sisa Makanan (Organik)"]; 

let model;

// 2. Fungsi memuat Graph Model saat halaman pertama kali dibuka
async function loadModel() {
    try {
        // Memuat model.json hasil konversi ekspos SavedModel
        model = await tf.loadGraphModel('./model/model.json'); 
        
        // Hilangkan layar loading setelah model siap di memori browser
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 600);

        document.getElementById('hasilPrediksi').innerText = "Model Siap! Silakan masukkan gambar.";
    } catch (error) {
        console.error("Error Loading Model: ", error);
        document.getElementById('hasilPrediksi').innerText = "Gagal memuat model AI.";
        document.querySelector('.loading-title').innerText = "Terjadi Kesalahan Koneksi/Model";
        document.querySelector('.loader-spinner').style.borderTopColor = "red";
    }
}

// 3. Fungsi memproses Tensor Gambar & Inferensi Klasifikasi Lokal

async function predictImage(imageElement) {
    if (!model) {
        console.error("Model belum siap!");
        return;
    }

    document.getElementById('hasilPrediksi').innerText = "Menganalisis jenis sampah...";

    try {
        // --- PERBAIKAN UTAMA 1: Paksa browser menyelesaikan decoding gambar ---
        // Ini memastikan gambar tidak dibaca sebagai matriks kosong (0) oleh WebGL
        await imageElement.decode();

        tf.tidy(() => {
            // --- PERBAIKAN UTAMA 2: Paksa ambil 3 channel warna (RGB), buang Alpha ---
            let rawTensor = tf.browser.fromPixels(imageElement, 3);

            // Resize gambar menjadi 224x224 sesuai input MobileNetV2
            let resizedTensor = tf.image.resizeBilinear(rawTensor, [224, 224]);

            // Ubah tipe data menjadi Float32 dan jadikan 4 dimensi [1, 224, 224, 3]
            let floatedTensor = resizedTensor.toFloat().expandDims(0);

            // --- NORMALISASI: Cocok 100% dengan preprocess_input di Colab kamu ---
            let normalizedTensor = floatedTensor.div(tf.scalar(127.5)).sub(tf.scalar(1.0));

            // --- INDIKATOR DEBUGGING: Intip isi tensor di Console (F12) ---
            const meanValue = normalizedTensor.mean().dataSync()[0];
            console.log("Nilai rata-rata tensor gambar (Harus BUKAN -1.0):", meanValue);

            // Jalankan Prediksi
            const output = model.predict(normalizedTensor);
            const predictions = output.dataSync();

            console.log("Probabilitas Mentah dari Model:", predictions); 

            // Cari nilai tertinggi
           // --- LOGIKA BARU UNTUK MODEL BINARY (1 OUTPUT NODE) ---
            const score = predictions[0]; // Ambil satu-satunya angka yang keluar
            
            let finalLabel = "";
            let accuracyPercent = 0;

            // Jika nilai di bawah 0.5 (Mendekati 0 = Indeks 0 = Botol Plastik)
            if (score < 0.5) {
                finalLabel = LABELS[0];
                // Balikkan persentase agar akurat (misal score 0.01 berarti 99% yakin itu botol)
                accuracyPercent = ((1.0 - score) * 100).toFixed(1);
            } 
            // Jika nilai di atas atau sama dengan 0.5 (Mendekati 1 = Indeks 1 = Sisa Makanan)
            else {
                finalLabel = LABELS[1];
                accuracyPercent = (score * 100).toFixed(1);
            }

            // Tampilkan hasil ke layar web
            document.getElementById('hasilPrediksi').innerText = 
                `Terdeteksi: ${finalLabel} (${accuracyPercent}%)`;
        });

    } catch (err) {
        console.error("Gagal memproses dekode gambar:", err);
        document.getElementById('hasilPrediksi').innerText = "Gagal memuat biner gambar.";
    }
}

// 4. Fungsi Integrasi ke Backend untuk Memanggil Gemini AI
async function fetchGeminiRecommendation(sampahLabel) {
    const geminiBox = document.getElementById('geminiBox');
    const geminiContent = document.getElementById('geminiContent');
    
    geminiBox.style.display = "block";
    geminiContent.innerText = `🤖 Menghubungi Gemini AI untuk menganalisis potensi ${sampahLabel}...`;

    try {
        /* CATATAN KEAMANAN: 
           Kirim data ke Backend kamu sendiri (misal Flask/Node.js). 
           Jangan menembak langsung API key Gemini dari JavaScript frontend ini.
        */
        const response = await fetch('http://localhost:5000/api/rekomendasi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jenis_sampah: sampahLabel })
        });

        if (response.ok) {
            const data = await response.json();
            // Tampilkan respons teks rekomendasi kerajinan dari backend
            geminiContent.innerText = data.rekomendasi;
        } else {
            throw new Error("Respons server backend bermasalah");
        }

    } catch (error) {
        console.warn("Koneksi backend belum aktif. Menampilkan simulasi data...");
        // MOCK / SIMULASI: Jika backend belum kamu buat, ini adalah visualisasi outputnya nanti
        setTimeout(() => {
            if (sampahLabel.includes("Botol")) {
                geminiContent.innerText = `💡 *Ide Kerajinan:* Pot Tanaman Gantung Lucu / Wadah Pensil Estetik.\n\n🛠️ *Langkah Pembuatan:* \n1. Potong bagian tengah botol plastik.\n2. Warnai menggunakan cat akrilik sesuai karakter kesukaan.\n3. Beri lubang kecil di bawah untuk drainase air.\n\n💰 *Estimasi Harga Jual:* Rp 10.000 - Rp 25.000 per unit.`;
            } else {
                geminiContent.innerText = `💡 *Ide Pemanfaatan:* Pupuk Kompos Organik Cair / Eco-Enzyme.\n\n🛠️ *Langkah Pembuatan:* \n1. Cacah sisa makanan (sayur/buah) menjadi potongan kecil.\n2. Campurkan dengan air tanah dan sedikit cairan gula di dalam wadah tertutup.\n3. Diamkan selama 2-3 minggu untuk proses fermentasi alami.\n\n💰 *Estimasi Harga Jual / Penghematan:* Rp 15.000 per botol pupuk cair.`;
            }
        }, 1500);
    }
}

// 5. Event Listener untuk mendeteksi aksi upload berkas gambar oleh pengguna
document.getElementById('uploadInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const imgElement = document.getElementById('gambarSampah');
        imgElement.src = URL.createObjectURL(file);
        imgElement.style.display = "block";
        
        // Tunggu hingga gambar ter-render sepenuhnya di layar, lalu eksekusi AI
        imgElement.onload = () => {
            predictImage(imgElement);
        };
    }
});

// Jalankan fungsi inisialisasi model saat web pertama kali dibuka
loadModel();