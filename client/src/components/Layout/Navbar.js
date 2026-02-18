import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch { /* ignore */ }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch { /* ignore */ }
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, [fetchUnread]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const iconForType = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'new_movie': return '🎬';
      case 'promo': return '🏷️';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative hover:text-purple-400 transition"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to={n.link || '#'}
                  onClick={() => { if (!n.read) markRead(n._id); setOpen(false); }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-800 transition border-b border-gray-800 ${!n.read ? 'bg-gray-800/50' : ''}`}
                >
                  <span className="text-lg mt-0.5">{iconForType(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isAuthPage = isLoginPage || isRegisterPage;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-black text-white border-b border-gray-800">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-purple-500">
          StreamX
        </Link>

        <div className="flex items-center gap-4">
          {!user && isAuthPage ? (
            <>
              {isLoginPage && (
                <Link to="/register" className="hover:text-purple-400">Register</Link>
              )}
              {isRegisterPage && (
                <Link to="/login" className="hover:text-purple-400">Sign in</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-purple-400">Home</Link>
              <Link to="/reels" className="hover:text-purple-400">Reels</Link>
              <Link to="/discussions" className="hover:text-purple-400">Discussion</Link>

              {user && (
                <>
                  
                  <Link to="/profile" className="hover:text-purple-400">Profile</Link>
                  <NotificationBell />
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-purple-400">Admin</Link>
              )}

              {!user ? (
                <>
                  <Link to="/login" className="hover:text-purple-400">Login</Link>
                  <Link to="/register" className="hover:text-purple-400">Register</Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
                >
                  Logout
                </button>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
