# AI Skill: Wiring Data with @media-sdk/core and @media-sdk/react

This document teaches AI coding assistants how to configure and wire data using the Headless Media SDK packages `@media-sdk/core` and `@media-sdk/react`.

## 1. SDK Core Client Setup

To use the SDK, you must first instantiate a `MediaCoreClient` with a Pexels API Key, then pass it to the `MediaProvider`.

### Code Pattern
```typescript
import { MediaCoreClient } from '@media-sdk/core';
import { MediaProvider } from '@media-sdk/react';

// Create the client instance (usually at the root of the app)
const client = new MediaCoreClient({
  apiKey: 'YOUR_PEXELS_API_KEY', // Avoid hardcoding, load from env or user input
  cacheTtlMs: 5 * 60 * 1000 // Optional: Cache lifetime in ms (default is 5 minutes)
});

function App() {
  return (
    <MediaProvider client={client}>
      <YourDashboard />
    </MediaProvider>
  );
}
```

## 2. Searching and Curated Content

Use `useMediaSearch` and `useMediaCurated` to fetch and paginate lists of photos or videos. Both hooks support infinite scrolling/pagination.

### Parameters
- `query` (only for `useMediaSearch`): String query. Updates trigger an automatic fetch of page 1.
- `options`:
  - `type`: `'photo' | 'video'` (default: `'photo'`)
  - `perPage`: `number` (default: `15`)

### Returns
- `data`: Array of `PexelsPhoto` or `PexelsVideo`.
- `loading`: Boolean, true when loading page 1.
- `loadingMore`: Boolean, true when loading subsequent pages.
- `error`: Error | null.
- `hasMore`: Boolean, true if there are more items to paginate.
- `loadMore`: Function, fetches the next page and appends data.
- `refresh`: Function, refetches page 1.

### React Integration Pattern
```typescript
import { useMediaSearch } from '@media-sdk/react';

function PhotoSearchGrid({ query }: { query: string }) {
  const { data, loading, loadingMore, error, hasMore, loadMore } = useMediaSearch(query, {
    type: 'photo',
    perPage: 12
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="grid">
        {data.map((photo) => (
          <div key={photo.id}>{photo.photographer}</div>
        ))}
      </div>
      {hasMore && (
        <button onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## 3. Emitting Activity Events

The core client automatically logs activity events, but the application must trigger these events when the user views or downloads media items. Use `useMediaEvents()` to obtain tracking handlers.

### SDK Events API
- `trackView(mediaId, mediaType, mediaUrl, title)`: Call this when a photo/video details modal or screen is opened.
- `trackDownload(mediaId, mediaType, mediaUrl, title)`: Call this when a user clicks the download button (e.g. opens the media original link).
- `subscribe(listener)`: Subscribe to activity logs. Returns a cleanup unsubscribe function.

### Event Tracking Pattern
```typescript
import { useMediaEvents } from '@media-sdk/react';

function LightboxItem({ item, type }) {
  const { trackView, trackDownload } = useMediaEvents();

  // Track view once when item mounts
  useEffect(() => {
    const url = type === 'photo' ? item.src.original : item.video_files[0]?.link;
    const title = type === 'photo' ? item.alt : `Video by ${item.user.name}`;
    
    trackView(item.id, type, url, title);
  }, [item.id, type, trackView]);

  const handleDownload = () => {
    const url = type === 'photo' ? item.src.original : item.video_files[0]?.link;
    const title = type === 'photo' ? item.alt : `Video by ${item.user.name}`;
    
    trackDownload(item.id, type, url, title);
    window.open(url, '_blank');
  };

  return (
    <div>
      {/* Media renderer */}
      <button onClick={handleDownload}>Download Media</button>
    </div>
  );
}
```

## 4. Live Events Listening (Activity Logger)

To build an activity monitor or console inside the app, subscribe to SDK events.

### Pattern
```typescript
import { useEffect, useState } from 'react';
import { useMediaEvents } from '@media-sdk/react';
import { MediaEventPayload } from '@media-sdk/core';

function ActivityMonitor() {
  const { subscribe } = useMediaEvents();
  const [logs, setLogs] = useState<MediaEventPayload[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setLogs((prev) => [event, ...prev]);
    });
    return unsubscribe;
  }, [subscribe]);

  return (
    <ul className="logs-panel">
      {logs.map((log, index) => (
        <li key={index}>
          [{new Date(log.timestamp).toLocaleTimeString()}] {log.type.toUpperCase()}: 
          {log.mediaType} #{log.mediaId}
        </li>
      ))}
    </ul>
  );
}
```
