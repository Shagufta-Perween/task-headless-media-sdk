import { useState, useCallback, useRef } from 'react';

export interface UseHeadlessReelSwiperRNOptions {
  totalItems: number;
  onActiveIndexChange?: (index: number) => void;
  initialIndex?: number;
}

export function useHeadlessReelSwiperRN({
  totalItems,
  onActiveIndexChange,
  initialIndex = 0
}: UseHeadlessReelSwiperRNOptions) {
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const flatListRef = useRef<any>(null);

  const onScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = event.nativeEvent.layoutMeasurement.height;
    if (height > 0) {
      const index = Math.round(offsetY / height);
      if (index !== activeIndex && index >= 0 && index < totalItems) {
        setActiveIndex(index);
        if (onActiveIndexChange) {
          onActiveIndexChange(index);
        }
      }
    }
  }, [activeIndex, totalItems, onActiveIndexChange]);

  const getScrollViewProps = useCallback(() => {
    return {
      ref: flatListRef,
      pagingEnabled: true,
      showsVerticalScrollIndicator: false,
      onMomentumScrollEnd: onScroll,
      decelerationRate: 'fast' as const,
      accessibilityRole: 'feed' as const,
      accessibilityLabel: 'Vertical media reels feed'
    };
  }, [onScroll]);

  const getReelItemProps = useCallback((index: number) => {
    return {
      accessibilityRole: 'article' as const,
      accessibilityLabel: `Video reel ${index + 1} of ${totalItems}`,
      accessible: true
    };
  }, [totalItems]);

  const scrollToReel = useCallback((index: number) => {
    if (flatListRef.current && typeof flatListRef.current.scrollToIndex === 'function') {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  }, []);

  return {
    activeIndex,
    scrollToReel,
    getScrollViewProps,
    getReelItemProps
  };
}
