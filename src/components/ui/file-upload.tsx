"use client";

import * as React from "react";
import { FileArchive, LoaderCircle, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileUploadProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: File | null;
  onChange: (file: File | null) => void;
  maxSizeMb?: number;
  isUploading?: boolean;
  helperText?: string;
  uploadText?: string;
};

function formatFileSize(file: File) {
  const sizeInMb = file.size / (1024 * 1024);

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(sizeInMb >= 10 ? 0 : 1)}MB`;
  }

  return `${Math.max(1, Math.round(file.size / 1024))}KB`;
}

function FileUpload({
  id,
  className,
  value,
  onChange,
  maxSizeMb = 30,
  isUploading = false,
  helperText,
  uploadText = "Upload your file here",
  disabled,
  required,
  accept,
  ...props
}: FileUploadProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isDisabled = disabled || isUploading;

  React.useEffect(() => {
    if (!value && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [value]);

  function setSelectedFile(file: File | null) {
    if (!file) {
      setError(null);
      onChange(null);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSizeMb}MB.`);
      onChange(null);
      return;
    }

    setError(null);
    onChange(file);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (isDisabled) {
      return;
    }

    setSelectedFile(event.dataTransfer.files.item(0));
  }

  function handleRemoveFile() {
    setSelectedFile(null);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        required={required && !value}
        disabled={isDisabled}
        className="sr-only"
        onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        {...props}
      />

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDisabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#7c3cff]/55 bg-[#fbfaff] px-5 py-8 text-center transition-colors",
          "hover:border-[#5b00ff] hover:bg-[#f6f0ff] focus-within:border-[#5b00ff] focus-within:ring-2 focus-within:ring-[#5b00ff]/15",
          isDragging && "border-[#5b00ff] bg-[#f2eaff]",
          isDisabled && "cursor-not-allowed opacity-70",
        )}
      >
        {isUploading ? (
          <LoaderCircle className="size-7 animate-spin text-[#666666]" />
        ) : (
          <Upload className="size-7 text-[#666666]" />
        )}
        <span className="mt-4 text-sm text-[#666666]">
          {isUploading ? "Uploading file..." : uploadText}
        </span>
      </label>

      <div className="flex items-center justify-between gap-3 text-sm text-[#666666]">
        <span>{helperText ?? `Maximum size: ${maxSizeMb}MB`}</span>
        {error ? <span className="text-[#a54141]">{error}</span> : null}
      </div>

      {value ? (
        <div className="flex items-center gap-3">
          <div className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] bg-[#eee5ff] px-4 py-3">
            <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[#5b00ff]/25 bg-white text-[#5b00ff]">
              <FileArchive className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#0d0d0d]">
                {value.name}
              </p>
              <p className="mt-1 text-xs text-[#333333]">
                {formatFileSize(value)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            disabled={isDisabled}
            className="size-10 text-[#e85d67] hover:bg-[#ffecef] hover:text-[#c73945]"
            aria-label="Remove selected file"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export { FileUpload };
