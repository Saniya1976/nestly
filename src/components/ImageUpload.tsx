"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
  onChange: (url: string,  imageUrl?:string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
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
   <UploadDropzone
  endpoint={endpoint}
  onClientUploadComplete={(res) => {
    console.log("Upload complete:", res);
    if (res && res.length > 0 && res[0].url) {
      onChange(res[0].url);
    }
  }}
  onUploadError={(error: Error) => {
    console.error("Upload error:", error);
  }}
  appearance={{
    label: {
      color: "#374151",
      fontSize: "16px",
      fontWeight: "500",
    },
    button: {
      backgroundColor: "#2563eb",
      color: "black",
      fontSize: "14px",
      padding: "8px 16px",
      borderRadius: "6px",
    },
    allowedContent: {
      color: "#6b7280",
      fontSize: "12px",
    },
    container: {
      border: "2px dashed #d1d5db",
      borderRadius: "8px",
      backgroundColor: "#f9fafb",
      padding: "20px",
    },
    uploadIcon: {
      color: "#2563eb",
      width: "40px",
      height: "40px",
    }
  }}
  className="ut-label:font-medium ut-button:bg-blue-600 ut-button:hover:bg-blue-700 ut-button:transition-colors"
/>
  );
}
export default ImageUpload;