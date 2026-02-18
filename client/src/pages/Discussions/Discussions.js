import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const CATEGORIES = ['All', 'Review', 'Discussion', 'Recommendation', 'Question'];

const Discussions = () => {
  const { user } = useContext(AuthContext);
  const [discussions, setDiscussions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  // Form state
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Review',
    movieTitle: '',
    rating: 5
  });

  useEffect(() => {
    fetchDiscussions();
  }, [activeCategory]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = activeCategory !== 'All' ? { category: activeCategory } : {};
      const res = await api.get('/discussions', { params });
      setDiscussions(res.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/discussions', form);
      setDiscussions([res.data, ...discussions]);
      setForm({ title: '', content: '', category: 'Review', movieTitle: '', rating: 5 });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await api.post(`/discussions/${id}/like`);
      setDiscussions(discussions.map(d => d._id === id ? res.data : d));
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  const handleComment = async (id) => {
    if (!commentText[id]?.trim()) return;
    try {
      const res = await api.post(`/discussions/${id}/comment`, { text: commentText[id] });
      setDiscussions(discussions.map(d => d._id === id ? res.data : d));
      setCommentText({ ...commentText, [id]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/discussions/${id}`);
      setDiscussions(discussions.filter(d => d._id !== id));
    } catch (error) {
      console.error('Error deleting discussion:', error);
    }
  };

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const categoryColors = {
    Review: 'bg-yellow-600',
    Discussion: 'bg-blue-600',
    Recommendation: 'bg-green-600',
    Question: 'bg-orange-600'
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Discussions</h1>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {showForm ? 'Cancel' : '+ New Post'}
          </button>
        </div>

        {/* New Post Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Review">Review</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Recommendation">Recommendation</option>
                    <option value="Question">Question</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Movie / TV Show</label>
                  <input
                    type="text"
                    placeholder="e.g. Interstellar"
                    value={form.movieTitle}
                    onChange={e => setForm({ ...form, movieTitle: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {form.category === 'Review' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className={`text-2xl ${star <= form.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Give your post a title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your thoughts..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition w-full"
              >
                Post
              </button>
            </div>
          </form>
        )}

        {/* Category Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No discussions yet</p>
            <p className="text-sm">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map(discussion => (
              <div key={discussion._id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                      {discussion.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{discussion.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{timeAgo(discussion.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${categoryColors[discussion.category]} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                      {discussion.category}
                    </span>
                    {user && discussion.user?._id === user._id && (
                      <button
                        type="button"
                        onClick={() => handleDelete(discussion._id)}
                        className="text-gray-500 hover:text-red-500 text-sm transition"
                        title="Delete"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Movie Title & Rating */}
                {discussion.movieTitle && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400 text-sm">🎬 {discussion.movieTitle}</span>
                    {discussion.rating && (
                      <span className="text-yellow-400 text-sm">
                        {'★'.repeat(discussion.rating)}{'☆'.repeat(5 - discussion.rating)}
                      </span>
                    )}
                  </div>
                )}

                {/* Title & Content */}
                <h3 className="text-lg font-semibold mb-1">{discussion.title}</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{discussion.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 border-t border-gray-800 pt-3">
                  <button
                    type="button"
                    onClick={() => handleLike(discussion._id)}
                    className={`flex items-center gap-1.5 text-sm transition ${
                      discussion.likes?.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    {discussion.likes?.includes(user?._id) ? '❤️' : '🤍'} {discussion.likes?.length || 0}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComments(discussion._id)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition"
                  >
                    💬 {discussion.comments?.length || 0}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments[discussion._id] && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    {/* Existing Comments */}
                    {discussion.comments?.length > 0 && (
                      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {discussion.comments.map((c, i) => (
                          <div key={c._id || i} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="bg-gray-800 rounded-lg px-3 py-2 text-sm flex-1">
                              <span className="font-medium text-purple-400">{c.user?.name || 'Unknown'}</span>
                              <p className="text-gray-300 mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[discussion._id] || ''}
                        onChange={e => setCommentText({ ...commentText, [discussion._id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleComment(discussion._id)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleComment(discussion._id)}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussions;
