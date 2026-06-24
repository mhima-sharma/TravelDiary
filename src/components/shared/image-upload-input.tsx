"use client";
import { useState, useRef, useTransition, useCallback } from "react";
import Image from "next/image";
import { ImagePlus, Link2, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadInputProps {
  label?: string;
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

// Client-side canvas compression before upload — reduces bandwidth significantly
async function compressOnClient(file: File, maxPx = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else { width = Math.round((width * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas compression failed")), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

async function uploadFile(file: File): Promise<{ url: string; originalKB: number; compressedKB: number; savedPercent: number }> {
  // Step 1: compress on client
  const compressed = await compressOnClient(file);
  const compressedFile = new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });

  // Step 2: send to server (server further converts to WebP)
  const fd = new FormData();
  fd.append("file", compressedFile);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

export function ImageUploadInput({ label = "Images", images, onChange, max }: ImageUploadInputProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const isAtMax = max !== undefined && images.length >= max;

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (images.includes(url)) { toast.error("Already added"); return; }
    if (max && images.length >= max) { toast.error(`Max ${max} image${max === 1 ? "" : "s"}`); return; }
    onChange([...images, url]);
    setUrlInput("");
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = max ? max - images.length : files.length;
    const toProcess = Array.from(files).slice(0, remaining);
    if (toProcess.length === 0) { toast.error(`Max ${max} image${max === 1 ? "" : "s"} reached`); return; }

    startTransition(async () => {
      const results = await Promise.allSettled(toProcess.map(uploadFile));
      const uploaded: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          const { url, originalKB, compressedKB, savedPercent } = r.value;
          uploaded.push(url);
          toast.success(`Uploaded — ${originalKB}KB → ${compressedKB}KB (${savedPercent}% saved)`);
        } else {
          toast.error(`${toProcess[i].name}: ${r.reason?.message ?? "Upload failed"}`);
        }
      });
      if (uploaded.length) onChange([...images, ...uploaded]);
    });
  }, [images, max, onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}

      {/* Tab switcher */}
      {!isAtMax && (
        <div className="flex rounded-lg border overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 transition-colors",
              tab === "upload" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <Upload className="h-3.5 w-3.5" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 transition-colors border-l",
              tab === "url" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <Link2 className="h-3.5 w-3.5" /> Paste URL
          </button>
        </div>
      )}

      {/* Upload tab */}
      {tab === "upload" && !isAtMax && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isPending && inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary hover:bg-muted/40",
            isPending && "pointer-events-none opacity-60"
          )}
        >
          {isPending ? (
            <><Loader2 className="h-7 w-7 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Uploading & compressing…</p></>
          ) : (
            <><ImagePlus className="h-7 w-7 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop images here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP · max 15 MB · auto-compressed to WebP</p>
            </div></>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={!max || max > 1}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* URL tab */}
      {tab === "url" && !isAtMax && (
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/photo.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          />
          <Button type="button" variant="outline" onClick={addUrl} disabled={!urlInput.trim()}>
            Add
          </Button>
        </div>
      )}

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {images.map((url, i) => (
            <div key={i} className="relative group h-20 w-28 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
              <Image src={url} alt="" fill className="object-cover" onError={() => {}} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 && images.length > 1 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Cover</span>
              )}
            </div>
          ))}
        </div>
      )}

      {max && <p className="text-xs text-muted-foreground">{images.length} / {max} image{max === 1 ? "" : "s"}</p>}
    </div>
  );
}
