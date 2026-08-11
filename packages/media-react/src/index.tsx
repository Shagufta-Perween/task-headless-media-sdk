import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MediaCoreClient, PexelsPhoto, PexelsVideo, MediaEventPayload } from '@media-sdk/core';

// Create Context
const MediaContext = createContext<MediaCoreClient | null>(null);

export interface MediaProviderProps {
  client: MediaCoreClient;
  children: React.ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ client, children }) => {
  return (
    <MediaContext.Provider value={client}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMediaClient = (): MediaCoreClient => {
  const client = useContext(MediaContext);
  if (!client) {
    throw new Error('useMediaClient must be used within a MediaProvider');
  }
  return client;
};

export interface HookOptions {
  type?: 'photo' | 'video';
  perPage?: number;
}

// Hook for searching photos or videos
export const useMediaSearch = (query: string, options: HookOptions = {}) => {
  const client = useMediaClient();
  const type = options.type ?? 'photo';
  const perPage = options.perPage ?? 15;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const queryRef = useRef(query);
  const typeRef = useRef(type);
  queryRef.current = query;
  typeRef.current = type;

  const fetchItems = useCallback(async (searchQuery: string, pageNum: number, isLoadMore = false) => {
    if (!searchQuery.trim()) {
      setData([]);
      setHasMore(false);
      return;
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }
    setError(null);

    try {
      if (typeRef.current === 'photo') {
        const response = await client.searchPhotos(searchQuery, pageNum, perPage);
        setData(prev => isLoadMore ? [...prev, ...response.photos] : response.photos);
        setHasMore(response.photos.length >= perPage);
      } else {
        const response = await client.searchVideos(searchQuery, pageNum, perPage);
        setData(prev => isLoadMore ? [...prev, ...response.videos] : response.videos);
        setHasMore(response.videos.length >= perPage);
      }
      setPage(pageNum);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [client, perPage]);

  // Handle query change
  useEffect(() => {
    fetchItems(query, 1, false);
  }, [query, type, fetchItems]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || !query.trim()) return;
    fetchItems(query, page + 1, true);
  }, [query, page, hasMore, loading, loadingMore, fetchItems]);

  const refresh = useCallback(() => {
    fetchItems(query, 1, false);
  }, [query, fetchItems]);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

// Hook for curated photos or videos
export const useMediaCurated = (options: HookOptions = {}) => {
  const client = useMediaClient();
  const type = options.type ?? 'photo';
  const perPage = options.perPage ?? 15;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const typeRef = useRef(type);
  typeRef.current = type;

  const fetchItems = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }
    setError(null);

    try {
      if (typeRef.current === 'photo') {
        const response = await client.getCuratedPhotos(pageNum, perPage);
        setData(prev => isLoadMore ? [...prev, ...response.photos] : response.photos);
        setHasMore(response.photos.length >= perPage);
      } else {
        const response = await client.getTrendingVideos(pageNum, perPage);
        setData(prev => isLoadMore ? [...prev, ...response.videos] : response.videos);
        setHasMore(response.videos.length >= perPage);
      }
      setPage(pageNum);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [client, perPage]);

  // Initial fetch and fetch when type changes
  useEffect(() => {
    fetchItems(1, false);
  }, [type, fetchItems]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchItems(page + 1, true);
  }, [page, hasMore, loading, loadingMore, fetchItems]);

  const refresh = useCallback(() => {
    fetchItems(1, false);
  }, [fetchItems]);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

// Hook to fetch details of a single media item
export const useMediaItem = (id: number, type: 'photo' | 'video') => {
  const client = useMediaClient();
  const [item, setItem] = useState<PexelsPhoto | PexelsVideo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const fetchItem = async () => {
      try {
        const data = type === 'photo' ? await client.getPhoto(id) : await client.getVideo(id);
        if (active) {
          setItem(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchItem();
    return () => {
      active = false;
    };
  }, [client, id, type]);

  return { item, loading, error };
};

// Hook for tracking events
export const useMediaEvents = () => {
  const client = useMediaClient();

  const trackView = useCallback((mediaId: number, mediaType: 'photo' | 'video', mediaUrl: string, title?: string) => {
    client.trackView(mediaId, mediaType, mediaUrl, title);
  }, [client]);

  const trackDownload = useCallback((mediaId: number, mediaType: 'photo' | 'video', mediaUrl: string, title?: string) => {
    client.trackDownload(mediaId, mediaType, mediaUrl, title);
  }, [client]);

  const subscribe = useCallback((listener: (event: MediaEventPayload) => void) => {
    return client.subscribe(listener);
  }, [client]);

  return {
    trackView,
    trackDownload,
    subscribe
  };
};
