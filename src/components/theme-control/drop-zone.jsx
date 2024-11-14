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

    const file = e.dataTransfer.files[0];
    if (file?.type === "application/json") {
      onFileDrop(file);
    } else {
      console.error("Please drop a JSON file");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileDrop(file);
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
            Drop theme file here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">Supports JSON files</p>
        </div>
      </div>
    </motion.div>
  );
};
