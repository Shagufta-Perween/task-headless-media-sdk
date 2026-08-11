import { useCallback } from 'react';

export interface UseHeadlessGridRNOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onEndReachedThreshold?: number; // threshold e.g. 0.5
}

export function useHeadlessGridRN({
  onLoadMore,
  hasMore,
  isLoading,
  onEndReachedThreshold = 0.5
}: UseHeadlessGridRNOptions) {
  
  const getFlatListProps = useCallback(() => {
    return {
      onEndReached: () => {
        if (hasMore && !isLoading) {
          onLoadMore();
        }
      },
      onEndReachedThreshold,
      keyExtractor: (item: any, index: number) => `grid-item-${item.id || index}`,
      accessibilityRole: 'grid' as const,
      'aria-busy': isLoading
    };
  }, [hasMore, isLoading, onLoadMore, onEndReachedThreshold]);

  const getGridItemProps = useCallback((index: number, label?: string) => {
    return {
      accessibilityRole: 'image' as const,
      accessibilityLabel: label ?? `Grid item ${index + 1}`,
      accessible: true
    };
  }, []);

  return {
    getFlatListProps,
    getGridItemProps
  };
}
