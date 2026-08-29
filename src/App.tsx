import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Dropzone } from './components/Dropzone';
import { convertImage, removeBackground } from './lib/converter';

type ImageFormat = 'webp' | 'jpeg' | 'png' | 'remove-bg';

interface ProcessedResult {
  fileName: string;
  originalSize: string;
  convertedSize: string;
  ratio: number;
  url: string;
  blob: Blob;
}

export default function App() {
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('webp');

  const handleFilesSelected = async (files: File[]) => {
    setLoading(true);
    const newResults: ProcessedResult[] = [];

    for (const file of files) {
      try {
        let res;
        let ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;

        if (targetFormat === 'remove-bg') {
          res = await removeBackground(file);
          ext = 'png';
        } else {
          res = await convertImage(file, targetFormat, { quality: 0.8 });
        }
        
        newResults.push({
          fileName: `${file.name.replace(/\.[^/.]+$/, '')}_${targetFormat === 'remove-bg' ? 'nobg' : 'converted'}.${ext}`,
          originalSize: (res.originalSize / 1024).toFixed(1) + ' KB',
          convertedSize: (res.convertedSize / 1024).toFixed(1) + ' KB',
          ratio: res.compressionRatio,
          url: res.convertedUrl,
          blob: res.convertedBlob,
        });
      } catch (err) {
        console.error('Gagal mengonversi file:', file.name, err);
      }
    }

    setResults((prev) => [...prev, ...newResults]);
    setLoading(false);
  };

  // Fungsi untuk mengunduh seluruh file dalam bentuk format ZIP
  const handleDownloadAllZip = async () => {
    if (results.length === 0) return;
    setZipping(true);

    try {
      const zip = new JSZip();

      results.forEach((item) => {
        zip.file(item.fileName, item.blob);
      });

      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `converted_images_${Date.now()}.zip`);
    } catch (err) {
      console.error('Gagal membuat file ZIP:', err);
    } finally {
      setZipping(false);
    }
  };

  const handleClearAll = () => {
    setResults([]);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>Universal Image Converter</h1>
      <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '24px' }}>
        100% Client-Side & Privacy First — File diproses langsung di browser.
      </p>

      {/* Control Panel Format */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <label htmlFor="format-select" style={{ fontWeight: 600 }}>Pilih Aksi / Format:</label>
        <select
          id="format-select"
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #4F46E5',
            backgroundColor: '#fff',
            fontWeight: 600,
            color: '#4F46E5',
            cursor: 'pointer',
          }}
        >
          <option value="webp">WEBP (Sangat Ringan)</option>
          <option value="jpeg">JPG / JPEG (Standar)</option>
          <option value="png">PNG (Kualitas Tinggi)</option>
          <option value="remove-bg">✨ Hapus Background (AI)</option>
        </select>
      </div>

      <Dropzone onFilesSelected={handleFilesSelected} />

      {loading && (
        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          {targetFormat === 'remove-bg' 
            ? '🤖 AI sedang mengunduh model & menghapus background (butuh beberapa detik)...' 
            : `Mengonversi gambar ke format ${targetFormat.toUpperCase()}...`}
        </p>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Hasil Konversi ({results.length})</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleDownloadAllZip}
                disabled={zipping}
                style={{
                  backgroundColor: '#10B981',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: zipping ? 'not-allowed' : 'pointer',
                }}
              >
                {zipping ? 'Membuat ZIP...' : '📦 Download All (.ZIP)'}
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  backgroundColor: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Bersihkan
              </button>
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {results.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <strong>{item.fileName}</strong>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {item.originalSize} → <strong>{item.convertedSize}</strong> ({item.ratio > 0 ? `Hemat ${item.ratio}%` : `Ukuran naik ${Math.abs(item.ratio)}%`})
                  </div>
                </div>
                <a
                  href={item.url}
                  download={item.fileName}
                  style={{
                    backgroundColor: '#4F46E5',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}