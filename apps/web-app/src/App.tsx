import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MediaCoreClient, PexelsPhoto, PexelsVideo, MediaEventPayload } from '@media-sdk/core';
import { MediaProvider, useMediaSearch, useMediaCurated, useMediaEvents } from '@media-sdk/react';
import { useHeadlessGrid, useHeadlessLightbox, useHeadlessReelSwiper } from '@media-sdk/ui-react';

type Tab = 'curated' | 'search' | 'reels';
type MediaType = 'photo' | 'video';

// --- Dashboard Component (wires up data, events, and headless UI) ---
const Dashboard: React.FC<{ onResetKey: () => void }> = ({ onResetKey }) => {
  const [activeTab, setActiveTab] = useState<Tab>('curated');
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  
  // Lightbox State
  const [lightboxItems, setLightboxItems] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Event Tracker
  const { trackView, trackDownload, subscribe } = useMediaEvents();
  const [logs, setLogs] = useState<MediaEventPayload[]>([]);

  // Search input debounce helper
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Subscribe to activity logs
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setLogs((prev) => [event, ...prev].slice(0, 50)); // limit logs list size to 50
    });
    return unsubscribe;
  }, [subscribe]);

  // Fetch Curated Hook
  const curatedResults = useMediaCurated({
    type: mediaType,
    perPage: 12
  });

  // Fetch Search Hook
  const searchResults = useMediaSearch(debouncedQuery, {
    type: mediaType,
    perPage: 12
  });

  // Fetch Trending Videos for Reels Hook
  const reelsResults = useMediaCurated({
    type: 'video',
    perPage: 10
  });

  // Determine active list data
  const currentFeed = useMemo(() => {
    if (activeTab === 'curated') {
      return curatedResults;
    } else {
      return searchResults;
    }
  }, [activeTab, curatedResults, searchResults]);

  // Headless Grid Hook configuration
  const {
    setSentinelRef,
    getGridProps,
    getGridItemProps,
    getLoadMoreButtonProps
  } = useHeadlessGrid({
    onLoadMore: currentFeed.loadMore,
    hasMore: currentFeed.hasMore,
    isLoading: currentFeed.loading || currentFeed.loadingMore
  });

  // Open Lightbox callback
  const handleOpenLightbox = (index: number, items: any[]) => {
    setLightboxItems(items);
    setLightboxIndex(index);
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar glass">
        <div className="logo-section">
          <div className="logo-icon">M</div>
          <div className="logo-text">
            <h1>Media SDK</h1>
          </div>
        </div>

        {/* API Settings */}
        <div className="settings-section">
          <h2>SDK Settings</h2>
          <div className="api-input-group">
            <button className="btn-save" onClick={onResetKey} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}>
              Clear API Key
            </button>
          </div>
        </div>

        {/* Activity Monitor Log */}
        <div className="activity-feed-section">
          <h2>Activity Console</h2>
          <div className="logs-container">
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
                No events recorded. Browse or download media to trigger events.
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`log-entry ${log.type}`}>
                  <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span className={`log-action ${log.type}`}>{log.type.toUpperCase()}</span>:{' '}
                  <span className="log-desc">
                    {log.mediaType} #{log.mediaId}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <main className="content-area">
        {/* Navigation & Header */}
        <header className="header glass">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'curated' ? 'active' : ''}`}
              onClick={() => { setActiveTab('curated'); setLightboxIndex(null); }}
            >
              Curated
            </button>
            <button 
              className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => { setActiveTab('search'); setLightboxIndex(null); }}
            >
              Search
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reels' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reels'); setLightboxIndex(null); }}
            >
              Reels Swiper
            </button>
          </div>

          {/* Search Controls */}
          {activeTab !== 'reels' && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
              {activeTab === 'search' && (
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search Pexels..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              
              <div className="tabs" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button
                  className={`tab-btn ${mediaType === 'photo' ? 'active' : ''}`}
                  onClick={() => setMediaType('photo')}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', boxShadow: 'none' }}
                >
                  Photos
                </button>
                <button
                  className={`tab-btn ${mediaType === 'video' ? 'active' : ''}`}
                  onClick={() => setMediaType('video')}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', boxShadow: 'none' }}
                >
                  Videos
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Viewport content */}
        <div className="viewport">
          {activeTab === 'reels' ? (
            <ReelsSwiperSection 
              results={reelsResults} 
              trackView={trackView}
              trackDownload={trackDownload}
            />
          ) : (
            <>
              {currentFeed.loading && (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ animation: 'spin 1s infinite linear' }}>⏳</div>
                  <p>Loading curated feed...</p>
                </div>
              )}

              {currentFeed.error && (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ color: 'red' }}>⚠️</div>
                  <p>API Call Failed: {currentFeed.error.message}</p>
                </div>
              )}

              {!currentFeed.loading && currentFeed.data.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  {activeTab === 'search' ? (
                    <p>No results found for "{debouncedQuery}". Try another search term!</p>
                  ) : (
                    <p>No curated media items found.</p>
                  )}
                </div>
              )}

              {currentFeed.data.length > 0 && (
                <div {...getGridProps()} className="media-grid">
                  {currentFeed.data.map((item, index) => {
                    const isVideo = 'video_files' in item;
                    const title = isVideo ? `Video by ${item.user.name}` : item.alt || `Photo by ${item.photographer}`;
                    const imgUrl = isVideo ? item.image : item.src.large;

                    return (
                      <div
                        {...getGridItemProps(index, title)}
                        className="media-card glass glass-hover"
                        onClick={() => handleOpenLightbox(index, currentFeed.data)}
                        key={`${item.id}-${index}`}
                      >
                        <span className="media-tag">{isVideo ? 'Video' : 'Photo'}</span>
                        <img src={imgUrl} alt={title} loading="lazy" />
                        <div className="card-overlay">
                          <p className="card-title">{title}</p>
                          <p className="card-author">{isVideo ? item.user.name : item.photographer}</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Infinite scroll sentinel */}
                  {currentFeed.hasMore && (
                    <div ref={setSentinelRef} className="sentinel">
                      {currentFeed.loadingMore ? 'Loading next page...' : ''}
                    </div>
                  )}

                  {/* Fallback load more button */}
                  {currentFeed.hasMore && !currentFeed.loadingMore && (
                    <div className="btn-load-more-container">
                      <button {...getLoadMoreButtonProps()} className="btn-load-more">
                        Load More Results
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Headless Lightbox Overlay Component */}
      <LightboxPortal
        isOpen={lightboxIndex !== null}
        currentIndex={lightboxIndex ?? 0}
        items={lightboxItems}
        onClose={() => setLightboxIndex(null)}
        onNext={() => setLightboxIndex(prev => (prev !== null && prev < lightboxItems.length - 1) ? prev + 1 : prev)}
        onPrev={() => setLightboxIndex(prev => (prev !== null && prev > 0) ? prev - 1 : prev)}
        trackView={trackView}
        trackDownload={trackDownload}
      />
    </div>
  );
};

// --- Subcomponent: Lightbox Portal ---
interface LightboxPortalProps {
  isOpen: boolean;
  currentIndex: number;
  items: any[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  trackView: (id: number, type: 'photo' | 'video', url: string, title?: string) => void;
  trackDownload: (id: number, type: 'photo' | 'video', url: string, title?: string) => void;
}

const LightboxPortal: React.FC<LightboxPortalProps> = ({
  isOpen,
  currentIndex,
  items,
  onClose,
  onNext,
  onPrev,
  trackView,
  trackDownload
}) => {
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
    totalItems: items.length
  });

  const currentItem = items[currentIndex];
  
  // Track View Event when Active Item Changes
  useEffect(() => {
    if (!isOpen || !currentItem) return;
    const isVideo = 'video_files' in currentItem;
    const type = isVideo ? 'video' : 'photo';
    const mediaUrl = isVideo ? currentItem.video_files[0]?.link : currentItem.src.original;
    const title = isVideo ? `Video by ${currentItem.user.name}` : currentItem.alt || `Photo by ${currentItem.photographer}`;

    trackView(currentItem.id, type, mediaUrl, title);
  }, [isOpen, currentIndex, currentItem, trackView]);

  if (!isOpen || !currentItem) return null;

  const isVideo = 'video_files' in currentItem;
  const title = isVideo ? `Video by ${currentItem.user.name}` : currentItem.alt || `Photo by ${currentItem.photographer}`;
  const photographerName = isVideo ? currentItem.user.name : currentItem.photographer;
  const downloadUrl = isVideo ? currentItem.video_files[0]?.link : currentItem.src.original;

  const handleDownload = () => {
    trackDownload(currentItem.id, isVideo ? 'video' : 'photo', downloadUrl, title);
    
    // Perform browser download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.download = `pexels-${isVideo ? 'video' : 'photo'}-${currentItem.id}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div {...getOverlayProps()} className="lightbox-backdrop">
      <div {...getLightboxProps()} className="lightbox-modal">
        {/* Navigation arrow buttons */}
        <button {...getPrevButtonProps()} className="lightbox-nav prev">
          &larr;
        </button>

        <div className="lightbox-content-wrapper">
          {/* Close button */}
          <button {...getCloseButtonProps()} className="lightbox-close">
            &times;
          </button>

          <div {...getMediaContainerProps()} className="lightbox-media-container">
            {isVideo ? (
              <video src={downloadUrl} controls autoPlay loop style={{ width: '100%', height: '100%' }} />
            ) : (
              <img src={currentItem.src.large2x} alt={title} />
            )}
          </div>

          <div className="lightbox-info">
            <div className="lightbox-meta">
              <h3>{title}</h3>
              <p>Uploaded by: {photographerName}</p>
            </div>
            <button className="btn-download" onClick={handleDownload}>
              Download Original
            </button>
          </div>
        </div>

        <button {...getNextButtonProps()} className="lightbox-nav next">
          &rarr;
        </button>
      </div>
    </div>
  );
};

// --- Subcomponent: Reels Swiper ---
interface ReelsSwiperSectionProps {
  results: ReturnType<typeof useMediaCurated>;
  trackView: (id: number, type: 'photo' | 'video', url: string, title?: string) => void;
  trackDownload: (id: number, type: 'photo' | 'video', url: string, title?: string) => void;
}

const ReelsSwiperSection: React.FC<ReelsSwiperSectionProps> = ({ results, trackView, trackDownload }) => {
  const { data: videos, loading, error } = results;

  const {
    activeIndex,
    scrollToReel,
    getSwiperContainerProps,
    getReelItemProps
  } = useHeadlessReelSwiper({
    totalItems: videos.length
  });

  const activeVideo = videos[activeIndex];

  // Track View Event when active reel changes
  useEffect(() => {
    if (!activeVideo) return;
    const mediaUrl = activeVideo.video_files[0]?.link;
    const title = `Video by ${activeVideo.user.name}`;
    trackView(activeVideo.id, 'video', mediaUrl, title);
  }, [activeIndex, activeVideo, trackView]);

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading videos for Reels Swiper...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>Failed to load reels: {error.message}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="empty-state">
        <p>No video reels found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div className="reels-viewport">
        <div {...getSwiperContainerProps()} className="reels-scroll-container">
          {videos.map((video, index) => {
            const isActive = index === activeIndex;
            const videoUrl = video.video_files[0]?.link;
            const title = `Video Reel by ${video.user.name}`;

            return (
              <div 
                {...getReelItemProps(index)} 
                className="reel-slide"
                key={video.id}
              >
                {isActive ? (
                  <video 
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="reel-video"
                  />
                ) : (
                  <img src={video.image} alt={title} className="reel-thumbnail" />
                )}

                <div className="reel-overlay">
                  <div className="reel-author">{video.user.name}</div>
                  <div className="reel-desc">Pexels Vertical Reel Duration: {video.duration}s</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Side Action Panel */}
        {activeVideo && (
          <div className="reel-indicators">
            <button 
              className="reel-indicator-btn" 
              onClick={() => {
                const videoUrl = activeVideo.video_files[0]?.link;
                trackDownload(activeVideo.id, 'video', videoUrl, `Reel by ${activeVideo.user.name}`);
                window.open(videoUrl, '_blank');
              }}
              title="Download Reel"
            >
              📥
            </button>
            <button 
              className="reel-indicator-btn" 
              disabled={activeIndex === 0}
              onClick={() => scrollToReel(activeIndex - 1)}
              title="Previous Reel"
            >
              ▲
            </button>
            <button 
              className="reel-indicator-btn" 
              disabled={activeIndex === videos.length - 1}
              onClick={() => scrollToReel(activeIndex + 1)}
              title="Next Reel"
            >
              ▼
            </button>
          </div>
        )}
      </div>
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Swipe or scroll vertically inside the player. Active video auto-plays!
      </p>
    </div>
  );
};

// --- App Entry Container (Handles Authentication State) ---
const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('pexels_api_key') || '';
  });
  const [tempKey, setTempKey] = useState<string>('');

  const client = useMemo(() => {
    if (!apiKey) return null;
    return new MediaCoreClient({ apiKey });
  }, [apiKey]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKey.trim()) {
      localStorage.setItem('pexels_api_key', tempKey.trim());
      setApiKey(tempKey.trim());
    }
  };

  const handleResetKey = () => {
    localStorage.removeItem('pexels_api_key');
    setApiKey('');
    setTempKey('');
  };

  if (!client) {
    return (
      <div className="auth-blocker">
        <div className="auth-card glass">
          <div className="logo-icon" style={{ margin: '0 auto', width: '50px', height: '50px', fontSize: '1.6rem' }}>M</div>
          <h2>Initialize Headless SDK</h2>
          <p>
            Please enter your free <a href="https://www.pexels.com/api/new/" target="_blank" rel="noreferrer">Pexels API Key</a> to initialize the core client SDK. Key is stored locally in your browser.
          </p>
          <form onSubmit={handleSaveKey} className="api-input-group">
            <input
              type="password"
              placeholder="Paste Pexels API Key here..."
              className="api-input"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              required
            />
            <button type="submit" className="btn-save">
              Connect SDK Client
            </button>
            <button 
              type="button" 
              className="btn-save" 
              onClick={() => {
                localStorage.setItem('pexels_api_key', 'mock_demo_key');
                setApiKey('mock_demo_key');
              }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', marginTop: '0.5rem' }}
            >
              Explore with Demo Data (No Key Required)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <MediaProvider client={client}>
      <Dashboard onResetKey={handleResetKey} />
    </MediaProvider>
  );
};

export default App;
