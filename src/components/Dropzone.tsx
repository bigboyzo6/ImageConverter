import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const isActive = isDragActive || isHovered;

  return (
    <div
      {...getRootProps()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `2px dashed ${isActive ? '#6366F1' : '#C7D2FE'}`,
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isActive ? '#EEF2FF' : '#F8FAFC',
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <input {...getInputProps()} />
      <UploadCloud 
        size={44} 
        color={isActive ? '#4F46E5' : '#818CF8'} 
        style={{ marginBottom: '16px', transition: 'color 0.2s ease' }} 
      />
      {isDragActive ? (
        <p style={{ fontWeight: 600, color: '#4F46E5', margin: 0, fontSize: '15px' }}>
          Lepaskan file di sini...
        </p>
      ) : (
        <div>
          <p style={{ fontWeight: 600, margin: '0 0 6px 0', color: '#1E293B', fontSize: '15px' }}>
            Tarik & lepas file gambar di sini, atau klik untuk memilih
          </p>
          <small style={{ color: '#94A3B8', fontSize: '13px' }}>
            Mendukung format PNG, JPG, JPEG, WebP, HEIC
          </small>
        </div>
      )}
    </div>
  );
};