"use client";

import { useEffect, useRef, useState } from "react";
import { getCachedOptions } from "@/lib/locations/client-cache";

export interface UseLocationOptionsResult {
  options: string[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

async function fetchOptions(url: string): Promise<string[]> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json.data as string[];
}

function useLocationOptions(url: string | null, cacheKey: string | null): UseLocationOptionsResult {
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!url || !cacheKey) {
      setOptions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);

    getCachedOptions(cacheKey, () => fetchOptions(url))
      .then((data) => {
        if (requestId.current === id) {
          setOptions(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (requestId.current === id) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setIsLoading(false);
        }
      });
  }, [url, cacheKey, retryCount]);

  return { options, isLoading, error, retry: () => setRetryCount((c) => c + 1) };
}

export function useCountries(): UseLocationOptionsResult {
  return useLocationOptions("/api/locations/countries", "countries");
}

export function useStates(country: string): UseLocationOptionsResult {
  const url = country ? `/api/locations/states?country=${encodeURIComponent(country)}` : null;
  const key = country ? `states:${country}` : null;
  return useLocationOptions(url, key);
}

export function useCities(country: string, state: string): UseLocationOptionsResult {
  const url = country && state
    ? `/api/locations/cities?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`
    : null;
  const key = country && state ? `cities:${country}:${state}` : null;
  return useLocationOptions(url, key);
}
