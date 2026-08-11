import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseHeadlessReelSwiperOptions {
  totalItems: number;
  onActiveIndexChange?: (index: number) => void;
  initialIndex?: number;
}

export function useHeadlessReelSwiper({
  totalItems,
  onActiveIndexChange,
  initialIndex = 0
}: UseHeadlessReelSwiperOptions) {
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const containerRef = useRef<HTMLElement | null>(null);
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const onActiveIndexChangeRef = useRef(onActiveIndexChange);
  onActiveIndexChangeRef.current = onActiveIndexChange;

  const setContainerRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);

  const setItemRef = useCallback((index: number, node: HTMLElement | null) => {
    if (node) {
      itemsRef.current.set(index, node);
    } else {
      itemsRef.current.delete(index);
    }
  }, []);

  // Configure Intersection Observer to detect which slide is currently in view
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute('data-reel-index');
            if (indexAttr !== null) {
              const index = parseInt(indexAttr, 10);
              setActiveIndex(index);
              if (onActiveIndexChangeRef.current) {
                onActiveIndexChangeRef.current(index);
              }
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6 // fire when 60% of the slide is visible
      }
    );

    // Observe all active items
    itemsRef.current.forEach((el) => {
      observer.observe(el);
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [totalItems]); // re-run if items list updates

  const getSwiperContainerProps = useCallback(() => {
    return {
      ref: setContainerRef,
      style: {
        scrollSnapType: 'y mandatory',
        overflowY: 'scroll' as const,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        scrollBehavior: 'smooth' as const
      },
      role: 'feed',
      'aria-label': 'Vertical video reels swiper'
    };
  }, [setContainerRef]);

  const getReelItemProps = useCallback((index: number) => {
    return {
      ref: (node: HTMLElement | null) => setItemRef(index, node),
      'data-reel-index': index,
      style: {
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always' as const,
        flexShrink: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative' as const
      },
      role: 'article',
      'aria-posinset': index + 1,
      'aria-setsize': totalItems,
      tabIndex: 0
    };
  }, [setItemRef, totalItems]);

  const scrollToReel = useCallback((index: number) => {
    const el = itemsRef.current.get(index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    activeIndex,
    scrollToReel,
    getSwiperContainerProps,
    getReelItemProps
  };
}
