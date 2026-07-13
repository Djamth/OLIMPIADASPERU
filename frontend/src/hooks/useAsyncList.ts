"use client";

import { alerts, getErrorMessage } from "@/utils/alerts";
import { useCallback, useEffect, useRef, useState } from "react";

type CacheEntry<T> = {
  data: T[];
  expiresAt: number;
};

type AsyncListOptions = {
  cacheKey?: string;
  ttlMs?: number;
  keepPreviousData?: boolean;
};

const listCache = new Map<string, CacheEntry<unknown>>();

function getCachedList<T>(cacheKey?: string) {
  if (!cacheKey) return null;
  const entry = listCache.get(cacheKey) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    listCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

function setCachedList<T>(cacheKey: string | undefined, data: T[], ttlMs: number) {
  if (!cacheKey) return;
  listCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateListCache(cacheKey?: string) {
  if (cacheKey) {
    listCache.delete(cacheKey);
    return;
  }
  listCache.clear();
}

export function useAsyncList<T>(loader: () => Promise<T[]>, options: AsyncListOptions = {}) {
  const { cacheKey, ttlMs = 60_000, keepPreviousData = true } = options;
  const cachedData = getCachedList<T>(cacheKey);
  const [data, setData] = useState<T[]>(cachedData ?? []);
  const [loading, setLoading] = useState(!cachedData);
  const hasDataRef = useRef(Boolean(cachedData?.length));
  const activeCacheKeyRef = useRef(cacheKey);

  const reload = useCallback(async () => {
    setLoading(!keepPreviousData || !hasDataRef.current);
    try {
      const result = await loader();
      setCachedList(cacheKey, result, ttlMs);
      hasDataRef.current = result.length > 0;
      activeCacheKeyRef.current = cacheKey;
      setData(result);
    } catch (error) {
      await alerts.error("Error al cargar datos", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [cacheKey, keepPreviousData, loader, ttlMs]);

  useEffect(() => {
    const cached = getCachedList<T>(cacheKey);
    if (cached) {
      hasDataRef.current = cached.length > 0;
      activeCacheKeyRef.current = cacheKey;
      setData(cached);
      setLoading(false);
      return;
    }
    if (cacheKey !== activeCacheKeyRef.current) {
      hasDataRef.current = false;
      setData([]);
      setLoading(true);
    }
    reload();
  }, [cacheKey, reload]);

  return { data, loading, reload, setData };
}
