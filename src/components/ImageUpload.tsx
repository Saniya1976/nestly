"use client";

import { useState } from "react";
import { XIcon, UploadIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
}

function ImageUpload({ onChange, value }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
      alert('File size must be less than 4MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (value) {
    return (
      <div className="relative size-40">
        <img src={value} alt="Upload" className="rounded-md size-40 object-cover" />
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <input
        type="file"
        id="file-upload"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <label htmlFor="file-upload" className="cursor-pointer">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Choose a file or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Image (4MB)
            </p>
          </div>
        )}
      </label>
    </div>
  );
}

export default ImageUpload;