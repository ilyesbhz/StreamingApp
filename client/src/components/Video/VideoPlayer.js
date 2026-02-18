import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ videoUrl, subtitles, onProgress }) => {
  const videoRef = useRef(null);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (onProgress) {
        onProgress(video.currentTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onProgress]);

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        className="w-full rounded-lg"
        controls
        src={`http://localhost:5000${videoUrl}`}
      >
        {subtitles && subtitles.map((sub, index) => (
          <track
            key={index}
            kind="subtitles"
            src={`http://localhost:5000${sub.url}`}
            srcLang={sub.language}
            label={sub.language}
          />
        ))}
      </video>
    </div>
  );
};

export default VideoPlayer;