"use client";

import { useCallback, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadBoxProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export default function UploadBox({ onFileSelect, error }: UploadBoxProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setPreview(null);
        setFileName("");
        onFileSelect(null);
        return;
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearFile = () => handleFile(null);

  return (
    <div className="w-full">
      {!preview ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300",
            dragOver
              ? "border-gold bg-gold/10"
              : "border-gold/30 bg-coffee-dark/40 hover:border-gold/60 hover:bg-coffee-dark/60",
            error && "border-danger"
          )}
        >
          <Upload className="w-10 h-10 text-gold/60 mb-3" />
          <p className="text-cream/80 text-sm font-medium">
            Баримтын зураг оруулах
          </p>
          <p className="text-cream/40 text-xs mt-1">
            JPEG, PNG, WebP (max 5MB)
          </p>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gold/30 bg-coffee-dark/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-contain bg-black/20"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-coffee-dark/90 to-transparent p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-cream/80 text-sm">
              <ImageIcon className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-1.5 rounded-full bg-danger/20 text-danger hover:bg-danger/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
