export const downloadVideoForOffline = async (videoUrl, videoId) => {
  try {
    const response = await fetch(`http://localhost:5000${videoUrl}`);
    const blob = await response.blob();
    
    // Store in IndexedDB
    const db = await openDB();
    await db.put('videos', { id: videoId, blob, downloadedAt: Date.now() });
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StreamXDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }
    };
  });
};

export const getOfflineVideo = async (videoId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.get(videoId);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};