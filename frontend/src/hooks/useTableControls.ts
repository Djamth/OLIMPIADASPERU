"use client";

import { useMemo, useState } from "react";

export function useTableControls<T>(
  data: T[],
  filter: (item: T, query: string) => boolean,
  initialPageSize = 10,
) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;
    return data.filter((item) => filter(item, normalized));
  }, [data, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updatePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return {
    query,
    setQuery: updateQuery,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize: updatePageSize,
    totalItems: data.length,
    filteredItems: filtered.length,
    totalPages,
    pageItems,
  };
}
