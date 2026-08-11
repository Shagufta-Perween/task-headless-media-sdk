import {
  MediaCoreClientConfig,
  PexelsPhotoResponse,
  PexelsVideoResponse,
  PexelsPhoto,
  PexelsVideo,
  MediaEventListener,
  MediaEventPayload,
  MediaCoreEvent
} from './types.js';

// --- Mock Data for Demo Mode (if API key is 'mock_demo_key') ---
const MOCK_PHOTOS = [
  {
    id: 3225517,
    width: 1920,
    height: 1200,
    url: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg",
    photographer: "Mads Schmidt Rasmussen",
    photographer_url: "https://www.pexels.com/@madsrasmussen",
    photographer_id: 111,
    avg_color: "#2a3d45",
    src: {
      original: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large2x: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800",
      medium: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=500",
      small: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=300",
      portrait: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600",
      landscape: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600",
      tiny: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    liked: false,
    alt: "Majestic green mountains under starry night sky"
  },
  {
    id: 2246476,
    width: 1920,
    height: 1280,
    url: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg",
    photographer: "Egor Kamelev",
    photographer_url: "https://www.pexels.com/@egorkamelev",
    photographer_id: 222,
    avg_color: "#4f5d65",
    src: {
      original: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large2x: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=800",
      medium: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=500",
      small: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=300",
      portrait: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=600",
      landscape: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=600",
      tiny: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    liked: false,
    alt: "Misty pine forest valley in autumn"
  },
  {
    id: 1770809,
    width: 1920,
    height: 1200,
    url: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg",
    photographer: "Luis del Río",
    photographer_url: "https://www.pexels.com/@luisdelrio",
    photographer_id: 333,
    avg_color: "#1c2d37",
    src: {
      original: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large2x: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800",
      medium: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=500",
      small: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=300",
      portrait: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=600",
      landscape: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=600",
      tiny: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    liked: false,
    alt: "Snow-covered mountains under dramatic orange sunset"
  },
  {
    id: 3408744,
    width: 1920,
    height: 1280,
    url: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg",
    photographer: "stein egil liland",
    photographer_url: "https://www.pexels.com/@steinliland",
    photographer_id: 444,
    avg_color: "#1e3a47",
    src: {
      original: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large2x: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800",
      medium: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=500",
      small: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=300",
      portrait: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600",
      landscape: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600",
      tiny: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    liked: false,
    alt: "Bright green Aurora Borealis northern lights over sea"
  },
  {
    id: 15286,
    width: 1920,
    height: 1280,
    url: "https://images.pexels.com/photos/15286/pexels-photo.jpg",
    photographer: "Luis del Río",
    photographer_url: "https://www.pexels.com/@luisdelrio",
    photographer_id: 333,
    avg_color: "#3f4e3c",
    src: {
      original: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
      large2x: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
      large: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
      medium: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=500",
      small: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300",
      portrait: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
      landscape: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
      tiny: "https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=150"
    },
    liked: false,
    alt: "Mysterious path in a green mossy forest"
  },
  {
    id: 3244513,
    width: 1920,
    height: 1200,
    url: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg",
    photographer: "stein egil liland",
    photographer_url: "https://www.pexels.com/@steinliland",
    photographer_id: 444,
    avg_color: "#28343f",
    src: {
      original: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large2x: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=1200",
      large: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=800",
      medium: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=500",
      small: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=300",
      portrait: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=600",
      landscape: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=600",
      tiny: "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    liked: false,
    alt: "Beautiful rocky ocean beach sunset"
  }
];

const MOCK_VIDEOS = [
  {
    id: 1,
    width: 640,
    height: 360,
    url: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054f4d9b3e30e277354786e75a2efce&profile_id=165&oauth2_token_id=57447761",
    image: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=500",
    duration: 15,
    user: {
      id: 11,
      name: "Nature Reels",
      url: "https://www.pexels.com"
    },
    video_files: [
      {
        id: 1111,
        quality: "sd" as const,
        file_type: "video/mp4",
        width: 640,
        height: 360,
        link: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054f4d9b3e30e277354786e75a2efce&profile_id=165&oauth2_token_id=57447761"
      }
    ],
    video_pictures: []
  },
  {
    id: 2,
    width: 640,
    height: 360,
    url: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdfaf19af1da824ef78ea645f7823f6c1ad5467&profile_id=165&oauth2_token_id=57447761",
    image: "https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=500",
    duration: 12,
    user: {
      id: 22,
      name: "Wildlands",
      url: "https://www.pexels.com"
    },
    video_files: [
      {
        id: 2222,
        quality: "sd" as const,
        file_type: "video/mp4",
        width: 640,
        height: 360,
        link: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdfaf19af1da824ef78ea645f7823f6c1ad5467&profile_id=165&oauth2_token_id=57447761"
      }
    ],
    video_pictures: []
  },
  {
    id: 3,
    width: 640,
    height: 360,
    url: "https://player.vimeo.com/external/517602124.sd.mp4?s=dcf22df72da41d08e4d3f56eb722cfa024f2b604&profile_id=165&oauth2_token_id=57447761",
    image: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=500",
    duration: 8,
    user: {
      id: 33,
      name: "Peak Footage",
      url: "https://www.pexels.com"
    },
    video_files: [
      {
        id: 3333,
        quality: "sd" as const,
        file_type: "video/mp4",
        width: 640,
        height: 360,
        link: "https://player.vimeo.com/external/517602124.sd.mp4?s=dcf22df72da41d08e4d3f56eb722cfa024f2b604&profile_id=165&oauth2_token_id=57447761"
      }
    ],
    video_pictures: []
  },
  {
    id: 4,
    width: 640,
    height: 360,
    url: "https://player.vimeo.com/external/538571052.sd.mp4?s=c83a73df0d15e1da74d3d0f04c66ff9ad695e1e7&profile_id=165&oauth2_token_id=57447761",
    image: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=500",
    duration: 10,
    user: {
      id: 44,
      name: "Visual Studio",
      url: "https://www.pexels.com"
    },
    video_files: [
      {
        id: 4444,
        quality: "sd" as const,
        file_type: "video/mp4",
        width: 640,
        height: 360,
        link: "https://player.vimeo.com/external/538571052.sd.mp4?s=c83a73df0d15e1da74d3d0f04c66ff9ad695e1e7&profile_id=165&oauth2_token_id=57447761"
      }
    ],
    video_pictures: []
  }
];

export class MediaCoreClient {
  private readonly apiKey: string;
  private readonly cacheTtlMs: number;
  private readonly cache = new Map<string, { data: any; expiry: number }>();
  private readonly pendingRequests = new Map<string, Promise<any>>();
  private readonly listeners = new Set<MediaEventListener>();

  constructor(config: MediaCoreClientConfig) {
    if (!config.apiKey) {
      throw new Error('MediaCoreClient: API key is required');
    }
    this.apiKey = config.apiKey;
    this.cacheTtlMs = config.cacheTtlMs ?? 5 * 60 * 1000; // default 5 minutes

    // Add a default listener that logs each event to the console
    this.subscribe((event) => {
      console.log(`[MediaCoreSDK Event] ${event.type.toUpperCase()}:`, {
        mediaType: event.mediaType,
        mediaId: event.mediaId,
        mediaUrl: event.mediaUrl,
        title: event.title,
        timestamp: new Date(event.timestamp).toLocaleTimeString()
      });
    });
  }

  /**
   * Subscribe to SDK events (e.g. view, download).
   * Returns an unsubscribe function.
   */
  public subscribe(listener: MediaEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an event to all subscribers.
   */
  private emit(type: MediaCoreEvent, mediaId: number, mediaType: 'photo' | 'video', mediaUrl: string, title?: string) {
    const payload: MediaEventPayload = {
      type,
      timestamp: Date.now(),
      mediaType,
      mediaId,
      mediaUrl,
      title
    };
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in MediaCoreClient event listener:', err);
      }
    });
  }

  /**
   * Track that an item has been viewed.
   */
  public trackView(mediaId: number, mediaType: 'photo' | 'video', mediaUrl: string, title?: string): void {
    this.emit('view', mediaId, mediaType, mediaUrl, title);
  }

  /**
   * Track that an item has been downloaded.
   */
  public trackDownload(mediaId: number, mediaType: 'photo' | 'video', mediaUrl: string, title?: string): void {
    this.emit('download', mediaId, mediaType, mediaUrl, title);
  }

  /**
   * Helper to execute GET requests with caching and request de-duplication.
   */
  private async get<T>(url: string): Promise<T> {
    const cacheKey = url;
    const now = Date.now();

    // Check in-memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > now) {
      return cached.data as T;
    }

    // Check if there is an in-flight request for the same URL (de-duplication)
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }

    // Perform actual fetch
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: this.apiKey
          }
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Pexels API Request failed with status ${response.status}: ${text || response.statusText}`);
        }

        const data = await response.json();

        // Save to cache
        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + this.cacheTtlMs
        });

        return data as T;
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Search photos from Pexels.
   */
  public async searchPhotos(query: string, page = 1, perPage = 15): Promise<PexelsPhotoResponse> {
    if (this.apiKey === 'mock_demo_key') {
      const filtered = MOCK_PHOTOS.filter(p => 
        p.alt.toLowerCase().includes(query.toLowerCase()) || 
        p.photographer.toLowerCase().includes(query.toLowerCase())
      );
      return {
        page,
        per_page: perPage,
        photos: filtered,
        total_results: filtered.length
      };
    }
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.pexels.com/v1/search?query=${encodedQuery}&page=${page}&per_page=${perPage}`;
    return this.get<PexelsPhotoResponse>(url);
  }

  /**
   * Fetch curated photos from Pexels.
   */
  public async getCuratedPhotos(page = 1, perPage = 15): Promise<PexelsPhotoResponse> {
    if (this.apiKey === 'mock_demo_key') {
      return {
        page,
        per_page: perPage,
        photos: MOCK_PHOTOS,
        total_results: MOCK_PHOTOS.length
      };
    }
    const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`;
    return this.get<PexelsPhotoResponse>(url);
  }

  /**
   * Fetch a single photo by ID.
   */
  public async getPhoto(id: number): Promise<PexelsPhoto> {
    if (this.apiKey === 'mock_demo_key') {
      const photo = MOCK_PHOTOS.find(p => p.id === id);
      if (!photo) throw new Error('Photo not found');
      return photo;
    }
    const url = `https://api.pexels.com/v1/photos/${id}`;
    return this.get<PexelsPhoto>(url);
  }

  /**
   * Search videos from Pexels.
   */
  public async searchVideos(query: string, page = 1, perPage = 15): Promise<PexelsVideoResponse> {
    if (this.apiKey === 'mock_demo_key') {
      const filtered = MOCK_VIDEOS.filter(v => 
        v.user.name.toLowerCase().includes(query.toLowerCase())
      );
      return {
        page,
        per_page: perPage,
        videos: filtered,
        total_results: filtered.length
      };
    }
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.pexels.com/videos/search?query=${encodedQuery}&page=${page}&per_page=${perPage}`;
    return this.get<PexelsVideoResponse>(url);
  }

  /**
   * Fetch popular/trending videos from Pexels.
   */
  public async getTrendingVideos(page = 1, perPage = 15): Promise<PexelsVideoResponse> {
    if (this.apiKey === 'mock_demo_key') {
      return {
        page,
        per_page: perPage,
        videos: MOCK_VIDEOS,
        total_results: MOCK_VIDEOS.length
      };
    }
    const url = `https://api.pexels.com/videos/popular?page=${page}&per_page=${perPage}`;
    return this.get<PexelsVideoResponse>(url);
  }

  /**
   * Fetch a single video by ID.
   */
  public async getVideo(id: number): Promise<PexelsVideo> {
    if (this.apiKey === 'mock_demo_key') {
      const video = MOCK_VIDEOS.find(v => v.id === id);
      if (!video) throw new Error('Video not found');
      return video;
    }
    const url = `https://api.pexels.com/videos/videos/${id}`;
    return this.get<PexelsVideo>(url);
  }

  /**
   * Helper to clear the request cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}
