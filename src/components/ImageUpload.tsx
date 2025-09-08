"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
  onChange: (url: string) => void;
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
    console.log("✅ Upload complete:", res);
    if (res && res.length > 0 && res[0].url) {
      onChange(res[0].url);
    }
  }}
  onUploadError={(error: Error) => {
    console.error("❌ Upload error:", error);
    // Show user-friendly error
    alert(`Upload failed: ${error.message || 'Please try again'}`);
  }}
  appearance={{
    label: { color: "#000000" }, // Force black text
    button: { 
      backgroundColor: "#2563eb", 
      color: "white",
      fontSize: "14px"
    },
    allowedContent: { color: "#000000" }, // Force black text
    container: { 
      border: "2px dashed #000000", // Black border for visibility
      backgroundColor: "#f9fafb" // Light gray background
    }
  }}
  className="ut-allowed-content:text-black ut-label:text-black"
/>
  );
}
export default ImageUpload;