import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    // Auto-play current video
    if (videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex].play();
    }
  }, [currentIndex]);

  const fetchReels = async () => {
    try {
      const res = await api.get('/reels');
      setReels(res.data);
    } catch (error) {
      console.error('Error fetching reels:', error);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const height = e.target.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    
    if (newIndex !== currentIndex && newIndex < reels.length) {
      // Pause previous video
      if (videoRefs.current[currentIndex]) {
        videoRefs.current[currentIndex].pause();
      }
      setCurrentIndex(newIndex);
    }
  };

  const handleLike = async (reelId) => {
    try {
      await api.post(`/reels/${reelId}/like`);
      // Update local state
      setReels(reels.map(reel =>
        reel._id === reelId ? { ...reel, likes: reel.likes + 1 } : reel
      ));
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  return (
    <div
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {reels.map((reel, index) => (
        <div
          key={reel._id}
          className="h-screen snap-start relative flex items-center justify-center bg-black"
        >
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            className="h-full w-auto max-w-full object-contain"
            src={`http://localhost:5000${reel.videoUrl}`}
            loop
            playsInline
          />
          
          <div className="absolute bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-black">
            <h3 className="text-xl font-bold mb-2">{reel.title}</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(reel._id)}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
              >
                ❤️ {reel.likes}
              </button>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                👁️ {reel.views}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReelsFeed;