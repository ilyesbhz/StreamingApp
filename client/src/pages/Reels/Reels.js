import React, { useState } from 'react';
import ReelsFeed from '../../components/Reel/ReelsFeed';
import MovieReelsFeed from '../../components/Reel/MovieReelsFeed';

const Reels = () => {
  const [activeTab, setActiveTab] = useState('movies');

  return (
    <div className="bg-black text-white relative">
      {/* Tabs */}
      <div className="fixed top-16 left-0 right-0 z-40 flex justify-center gap-4 py-2 bg-black/80 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setActiveTab('movies')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            activeTab === 'movies'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Movie Reels
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('user')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            activeTab === 'user'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          User Reels
        </button>
      </div>

      {/* Feed */}
      {activeTab === 'movies' ? <MovieReelsFeed /> : <ReelsFeed />}
    </div>
  );
};

export default Reels;
