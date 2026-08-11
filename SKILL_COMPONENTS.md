# AI Skill: Building Pure UI Layouts with @media-sdk/ui-react and @media-sdk/ui-native

This document teaches AI coding assistants how to consume the headless UI hooks from `@media-sdk/ui-react` (Web) and `@media-sdk/ui-native` (React Native). 

> [!IMPORTANT]
> Headless components ship **no styles** and have **no dependencies** on the SDK wrappers or API clients. They take clean props (data, callbacks) and return **prop-getters** (functions returning ARIA, roles, ref-setters, and styles) to bind to JSX elements.

---

## 1. Infinite-Scroll Grid (`useHeadlessGrid`)

Handles scrolling intersection detection, grid semantics, and accessibility.

### Web Usage Example
```tsx
import { useHeadlessGrid } from '@media-sdk/ui-react';

function PhotoGrid({ items, onLoadMore, hasMore, isLoading }) {
  const { 
    setSentinelRef, 
    getGridProps, 
    getGridItemProps, 
    getLoadMoreButtonProps 
  } = useHeadlessGrid({
    onLoadMore,
    hasMore,
    isLoading
  });

  return (
    <div {...getGridProps()} className="grid-container">
      {items.map((item, index) => (
        <div 
          {...getGridItemProps(index, item.alt)} 
          className="grid-card" 
          key={item.id}
        >
          <img src={item.src.medium} alt={item.alt} />
        </div>
      ))}
      
      {/* Intersection Sentinel element for infinite scroll */}
      {hasMore && (
        <div 
          ref={setSentinelRef} 
          className="sentinel"
        >
          {isLoading && <span>Loading more...</span>}
        </div>
      )}

      {/* Fallback button if user has scrolled too fast or intersection observer is disabled */}
      <button {...getLoadMoreButtonProps()} className="btn-load-more">
        Load More
      </button>
    </div>
  );
}
```

---

## 2. Accessible Lightbox Modal (`useHeadlessLightbox`)

Manages modal states, focus trap, and keyboard events (Escape to close, Left/Right arrow keys for navigation).

### Web Usage Example
```tsx
import { useHeadlessLightbox } from '@media-sdk/ui-react';

function Lightbox({ isOpen, onClose, onNext, onPrev, currentIndex, totalItems, items }) {
  const {
    getLightboxProps,
    getOverlayProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
    getMediaContainerProps
  } = useHeadlessLightbox({
    isOpen,
    onClose,
    onNext,
    onPrev,
    currentIndex,
    totalItems
  });

  if (!isOpen) return null;

  const currentItem = items[currentIndex];

  return (
    <div {...getOverlayProps()} className="lightbox-backdrop">
      <div {...getLightboxProps()} className="lightbox-modal">
        {/* Close Button */}
        <button {...getCloseButtonProps()} className="lightbox-close">
          &times;
        </button>

        {/* Navigation Controls */}
        <button {...getPrevButtonProps()} className="lightbox-nav prev">
          &larr;
        </button>

        <div {...getMediaContainerProps()} className="lightbox-content">
          {currentItem.type === 'photo' ? (
            <img src={currentItem.data.src.large2x} alt={currentItem.data.alt} />
          ) : (
            <video src={currentItem.data.video_files[0]?.link} controls autoPlay />
          )}
        </div>

        <button {...getNextButtonProps()} className="lightbox-nav next">
          &rarr;
        </button>
      </div>
    </div>
  );
}
```

---

## 3. Reels Swiper with CSS Snap-Scroll (`useHeadlessReelSwiper`)

Wires snap styles and detects active index through IntersectionObserver on web container scroll.

### Web Usage Example
```tsx
import { useHeadlessReelSwiper } from '@media-sdk/ui-react';

function ReelsContainer({ videos }) {
  const {
    activeIndex,
    scrollToReel,
    getSwiperContainerProps,
    getReelItemProps
  } = useHeadlessReelSwiper({
    totalItems: videos.length
  });

  return (
    <div className="reels-viewport">
      <div {...getSwiperContainerProps()} className="reels-container">
        {videos.map((video, index) => {
          const isActive = index === activeIndex;
          return (
            <div 
              {...getReelItemProps(index)} 
              className={`reel-slide ${isActive ? 'active' : ''}`}
              key={video.id}
            >
              {isActive ? (
                <video 
                  src={video.video_files[0]?.link} 
                  controls 
                  autoPlay 
                  loop 
                  muted
                  className="reel-video" 
                />
              ) : (
                <img 
                  src={video.image} 
                  alt="Video thumbnail" 
                  className="reel-thumbnail" 
                />
              )}
              <div className="reel-details">
                <h3>Video by {video.user.name}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 4. React Native Layouts (`@media-sdk/ui-native`)

Same logic but bound to React Native scroll offsets, modalities, and accessibilities.

### Scroll/Snapping FlatList Reels (Native)
```tsx
import { useHeadlessReelSwiperRN } from '@media-sdk/ui-native';
import { View, FlatList, Text } from 'react-native';

function NativeReels({ videos }) {
  const {
    activeIndex,
    getScrollViewProps,
    getReelItemProps
  } = useHeadlessReelSwiperRN({
    totalItems: videos.length
  });

  return (
    <FlatList
      {...getScrollViewProps()}
      data={videos}
      renderItem={({ item, index }) => (
        <View 
          {...getReelItemProps(index)} 
          style={{ height: '100%', justifyContent: 'center' }}
        >
          <Text>Video index {index} (Active: {index === activeIndex ? 'Yes' : 'No'})</Text>
        </View>
      )}
    />
  );
}
```
