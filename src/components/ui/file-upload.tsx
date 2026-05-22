"use client";

import * as React from "react";
import { FileArchive, LoaderCircle, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileUploadProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: File | File[] | null;
  onChange: (file: File | File[] | null) => void;
  maxSizeMb?: number;
  maxFiles?: number;
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
  maxFiles = 6,
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
  const selectedFiles = Array.isArray(value) ? value : value ? [value] : [];
  const isMultiple = Boolean(props.multiple);

  React.useEffect(() => {
    if (selectedFiles.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [selectedFiles.length]);

  function setSelectedFiles(files: File[], options?: { append?: boolean }) {
    const nextFiles =
      isMultiple && options?.append ? [...selectedFiles, ...files] : files;

    if (files.length === 0 && options?.append) {
      return;
    }

    if (files.length === 0) {
      setError(null);
      onChange(isMultiple ? [] : null);
      return;
    }

    const oversizedFile = nextFiles.find((file) => file.size > maxSizeMb * 1024 * 1024);
    if (oversizedFile) {
      setError(`Ukuran file maksimal ${maxSizeMb}MB.`);
      onChange(isMultiple ? [] : null);
      return;
    }

    setError(null);
    onChange(isMultiple ? nextFiles.slice(0, maxFiles) : nextFiles[0]);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (isDisabled) {
      return;
    }

    setSelectedFiles(Array.from(event.dataTransfer.files), { append: true });
  }

  function handleRemoveFile(fileIndex: number) {
    if (!isMultiple) {
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(selectedFiles.filter((_, index) => index !== fileIndex));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        required={required && selectedFiles.length === 0}
        disabled={isDisabled}
        className="sr-only"
        onChange={(event) =>
          setSelectedFiles(Array.from(event.target.files ?? []), { append: true })
        }
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
          "flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#2b4316]/55 bg-[#fffee1] px-5 py-8 text-center transition-colors",
          "hover:border-[#3f6901] hover:bg-[#efeee7] focus-within:border-[#3f6901] focus-within:ring-2 focus-within:ring-[#3f6901]/15",
          isDragging && "border-[#3f6901] bg-[#e9e8e1]",
          isDisabled && "cursor-not-allowed opacity-70",
        )}
      >
        {isUploading ? (
          <LoaderCircle className="size-7 animate-spin text-[#44483e]" />
        ) : (
          <Upload className="size-7 text-[#44483e]" />
        )}
        <span className="mt-4 text-sm text-[#44483e]">
          {isUploading ? "Uploading file..." : uploadText}
        </span>
      </label>

      <div className="flex items-center justify-between gap-3 text-sm text-[#44483e]">
        <span>
          {helperText ??
            (isMultiple
              ? `Maximum ${maxFiles} files, ${maxSizeMb}MB each`
              : `Maximum size: ${maxSizeMb}MB`)}
        </span>
        {error ? <span className="text-[#93000a]">{error}</span> : null}
      </div>

      {selectedFiles.length > 0 ? (
        <div className="grid gap-3">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-3">
              <div className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-lg bg-[#cdedae] px-4 py-3">
                <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3f6901]/25 bg-white text-[#3f6901]">
                  <FileArchive className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1a1c18]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-[#44483e]">
                    {formatFileSize(file)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(index)}
                disabled={isDisabled}
                className="size-10 text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a]"
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { FileUpload };
