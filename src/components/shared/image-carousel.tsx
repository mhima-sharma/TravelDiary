"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselImage {
  id: string;
  url: string;
  alt?: string | null;
}

export function ImageCarousel({ images, title }: { images: CarouselImage[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <>
      <div className="relative rounded-xl overflow-hidden select-none">
        {/* Main image */}
        <div className="relative h-[280px] sm:h-[380px] md:h-[460px] w-full bg-muted">
          <Image
            src={images[current].url}
            alt={images[current].alt || title}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Zoom button */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-14 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
              {current + 1} / {images.length}
            </div>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === current ? "bg-white w-5" : "bg-white/50 w-2 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow transition-all hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow transition-all hover:scale-105"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 px-0.5">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  i === current
                    ? "border-primary opacity-100 ring-2 ring-primary/30"
                    : "border-transparent opacity-60 hover:opacity-90"
                )}
              >
                <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
            onClick={() => setLightbox(false)}
          >
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="relative w-full max-w-4xl max-h-[85vh] aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[current].url}
              alt={images[current].alt || title}
              fill
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <p className="absolute bottom-4 text-white/70 text-sm">{current + 1} / {images.length}</p>
          )}
        </div>
      )}
    </>
  );
}
