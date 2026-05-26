import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

const LABELS = ["Botol Plastik (Anorganik)", "Sisa Makanan (Organik)"];

export const useDeteksiSampah = (modelUrl = '/model/model.json') => {
  const [model, setModel] = useState(null);
  const [statusText, setStatusText] = useState('Memuat Model AI...');
  const [isReady, setIsReady] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [hasil, setHasil] = useState(null);

  // Load Model Otomatis
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadGraphModel(modelUrl);
        if (isMounted) {
          setModel(loadedModel);
          setIsReady(true);
          setStatusText('Model Siap!');
        }
      } catch (error) {
        if (isMounted) {
          setStatusText('Gagal memuat model AI');
          console.error("TFJS Error:", error);
        }
      }
    };
    loadModel();
    
    return () => { isMounted = false; };
  }, [modelUrl]);

  // Fungsi Eksekusi Prediksi
  const prediksi = useCallback(async (imageElement) => {
    if (!model) return null;
    
    setIsPredicting(true);
    setHasil(null);

    try {
      await imageElement.decode();

      const hasilPrediksi = tf.tidy(() => {
        let rawTensor = tf.browser.fromPixels(imageElement, 3);
        let resizedTensor = tf.image.resizeBilinear(rawTensor, [224, 224]);
        let floatedTensor = resizedTensor.toFloat().expandDims(0);
        let normalizedTensor = floatedTensor.div(tf.scalar(127.5)).sub(tf.scalar(1.0));

        const output = model.predict(normalizedTensor);
        const score = output.dataSync()[0]; 
        
        let label = score < 0.5 ? LABELS[0] : LABELS[1];
        let confidence = score < 0.5 ? (1.0 - score) * 100 : score * 100;

        return {
          label: label,
          confidence: confidence.toFixed(1),
          rawScore: score
        };
      });

      setHasil(hasilPrediksi);
      return hasilPrediksi;
    } catch (error) {
      console.error("Gagal saat memprediksi:", error);
      return null;
    } finally {
      setIsPredicting(false);
    }
  }, [model]);

  // Reset hasil
  const resetHasil = () => setHasil(null);

  return { 
    isReady, 
    statusText, 
    isPredicting, 
    hasil, 
    prediksi,
    resetHasil 
  };
};