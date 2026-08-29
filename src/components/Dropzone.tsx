import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic'],
    },
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #4F46E5',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#EEF2FF' : '#FAFAFA',
        transition: 'background-color 0.2s ease',
      }}
    >
      <input {...getInputProps()} />
      <UploadCloud size={48} color="#4F46E5" style={{ margin: '0 auto 12px' }} />
      {isDragActive ? (
        <p style={{ fontWeight: 600, color: '#4F46E5' }}>Lepaskan file di sini...</p>
      ) : (
        <div>
          <p style={{ fontWeight: 600, margin: '0 0 4px' }}>
            Tarik & lepas file gambar di sini, atau klik untuk memilih
          </p>
          <small style={{ color: '#6B7280' }}>Mendukung format PNG, JPG, JPEG, WebP</small>
        </div>
      )}
    </div>
  );
};