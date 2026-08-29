export interface ConversionOptions {
  quality: number;
  maxWidth?: number; 
}

export interface ConvertedFile {
  id: string;
  originalFile: File;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
}