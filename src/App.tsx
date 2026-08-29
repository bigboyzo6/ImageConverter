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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '48px 20px',
      color: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        padding: '40px',
        border: '1px solid #F1F5F9'
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Universal Image Converter
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
            🔒 100% Client-Side & Privacy First — File diproses langsung di browser Anda.
          </p>
        </div>

        {/* Control Panel Format */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px',
          backgroundColor: '#F8FAFC',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0'
        }}>
          <label htmlFor="format-select" style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
            Pilih Aksi / Format:
          </label>
          <select
            id="format-select"
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #C7D2FE',
              backgroundColor: '#EEF2FF',
              fontSize: '14px',
              fontWeight: 600,
              color: '#4F46E5',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
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
          <div style={{
            textAlign: 'center',
            margin: '24px 0 12px 0',
            fontSize: '14px',
            color: '#4F46E5',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span>⏳</span>
            <span>
              {targetFormat === 'remove-bg' 
                ? 'AI sedang mengunduh model & menghapus background...' 
                : `Mengonversi gambar ke format ${targetFormat.toUpperCase()}...`}
            </span>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: '36px', borderTop: '1px solid #F1F5F9', paddingTop: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#1E293B' }}>
                Hasil Konversi ({results.length})
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDownloadAllZip}
                  disabled={zipping}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: zipping ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
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
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Bersihkan
                </button>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {results.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    gap: '16px'
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {item.fileName}
                    </strong>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {item.originalSize} → <strong style={{ color: '#059669', fontWeight: 600 }}>{item.convertedSize}</strong> ({item.ratio > 0 ? `Hemat ${item.ratio}%` : `Ukuran naik ${Math.abs(item.ratio)}%`})
                    </div>
                  </div>
                  <a
                    href={item.url}
                    download={item.fileName}
                    style={{
                      backgroundColor: '#4F46E5',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease'
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
    </div>
  );
}