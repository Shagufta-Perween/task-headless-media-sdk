export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsVideoFile {
  id: number;
  quality: 'hd' | 'sd';
  file_type: string;
  width: number | null;
  height: number | null;
  link: string;
}

export interface PexelsVideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

export interface PexelsPhotoResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

export interface PexelsVideoResponse {
  page: number;
  per_page: number;
  videos: PexelsVideo[];
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

export type MediaItem = 
  | { type: 'photo'; data: PexelsPhoto }
  | { type: 'video'; data: PexelsVideo };

export type MediaCoreEvent = 'view' | 'download';

export interface MediaEventPayload {
  type: MediaCoreEvent;
  timestamp: number;
  mediaType: 'photo' | 'video';
  mediaId: number;
  mediaUrl: string;
  title?: string;
}

export type MediaEventListener = (event: MediaEventPayload) => void;

export interface MediaCoreClientConfig {
  apiKey: string;
  cacheTtlMs?: number; // in-memory cache TTL, default 5 minutes
}
