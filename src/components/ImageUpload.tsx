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

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('File size must be less than 4MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch (error) {
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
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (value) {
    return (
      <div className="relative size-40">
        <img 
          src={value} 
          alt="Uploaded preview" 
          className="rounded-md size-40 object-cover border"
        />
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm hover:bg-red-600 transition-colors"
          type="button"
          disabled={isUploading}
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

 return (
  <div
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center bg-white dark:bg-[#121212] transition-colors cursor-pointer"
  >
    <input
      type="file"
      id="file-upload"
      accept="image/*"
      onChange={handleFileSelect}
      className="hidden"
      disabled={isUploading}
    />
    
    <label htmlFor="file-upload" className="cursor-pointer block">
      {isUploading ? (
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-6 w-6 text-gray-600 dark:text-gray-500 animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <UploadIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Choose a file or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Image (4MB)
            </p>
          </div>
        </div>
      )}
    </label>
  </div>
);
}

export default ImageUpload;
