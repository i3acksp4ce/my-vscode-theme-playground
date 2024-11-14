import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useState } from "react";
import { cn } from "../../lib/utils";

export const DropZone = ({ onFileDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/json"
    );

    if (files.length > 0) {
      onFileDrop(files);
    } else {
      console.error("Please drop JSON files");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileDrop(files);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-primary/50"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 cursor-pointer"
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drop theme files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Supports multiple JSON files
          </p>
        </div>
      </div>
    </motion.div>
  );
};
