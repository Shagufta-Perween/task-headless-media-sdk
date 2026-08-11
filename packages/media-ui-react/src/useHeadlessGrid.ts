import { useEffect, useRef, useCallback } from 'react';

export interface UseHeadlessGridOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // visibility ratio, e.g., 0.1
  rootMargin?: string; // e.g. '100px'
  enableIntersectionObserver?: boolean;
}

export function useHeadlessGrid({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = '100px',
  enableIntersectionObserver = true
}: UseHeadlessGridOptions) {
  const sentinelRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const setSentinelRef = useCallback((node: HTMLElement | null) => {
    sentinelRef.current = node;

    // Disconnect old observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || !enableIntersectionObserver) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          onLoadMoreRef.current();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, [enableIntersectionObserver, threshold, rootMargin]);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const getGridProps = useCallback(() => {
    return {
      role: 'grid',
      'aria-busy': isLoading,
      'aria-colcount': -1, // dynamic number of columns
    };
  }, [isLoading]);

  const getGridItemProps = useCallback((index: number, label?: string) => {
    return {
      key: `grid-item-${index}`,
      role: 'gridcell',
      tabIndex: 0,
      'aria-label': label ?? `Grid item ${index + 1}`
    };
  }, []);

  const getLoadMoreButtonProps = useCallback(() => {
    return {
      onClick: () => {
        if (hasMore && !isLoading) {
          onLoadMore();
        }
      },
      disabled: !hasMore || isLoading,
      role: 'button',
      'aria-live': 'polite' as const
    };
  }, [hasMore, isLoading, onLoadMore]);

  return {
    setSentinelRef,
    getGridProps,
    getGridItemProps,
    getLoadMoreButtonProps
  };
}
