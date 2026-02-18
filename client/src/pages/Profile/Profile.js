import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    try {
      const res = await api.put('/auth/profile', { name, email });
      setUser(res.data);
      setProfileMsg('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      setPwMsg(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    } catch (error) {
      setPwError(error.response?.data?.message || 'Error changing password');
    }
  };

  const planColors = {
    free: 'border-gray-600 text-gray-400',
    basic: 'border-blue-500 text-blue-400',
    premium: 'border-yellow-500 text-yellow-400'
  };

  const planLabels = {
    free: 'Free',
    basic: 'Basic',
    premium: 'Premium'
  };

  const planIcons = {
    free: '🆓',
    basic: '⭐',
    premium: '👑'
  };

  const currentPlan = user?.subscription?.plan || 'free';
  const expiresAt = user?.subscription?.expiresAt;
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold">My Profile</h1>

        {/* Avatar & Quick Info */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">{user?.name}</h2>
            <p className="text-gray-400 text-sm truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full capitalize">
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        {/* Membership Plan */}
        <div className={`bg-gray-900 rounded-xl p-6 border ${planColors[currentPlan]?.split(' ')[0] || 'border-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Membership Plan</h3>
            <span className={`text-2xl`}>{planIcons[currentPlan]}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-3xl font-bold capitalize ${planColors[currentPlan]?.split(' ')[1] || 'text-gray-400'}`}>
              {planLabels[currentPlan]}
            </span>
            {currentPlan !== 'free' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isExpired ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'
              }`}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
            )}
          </div>
          {currentPlan !== 'free' && expiresAt && (
            <p className="text-sm text-gray-500">
              {isExpired ? 'Expired on' : 'Renews on'}{' '}
              {new Date(expiresAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}
          {currentPlan === 'free' && (
            <p className="text-sm text-gray-500">Upgrade to Basic or Premium for unlimited access.</p>
          )}

          {/* Plan features */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {['free', 'basic', 'premium'].map(plan => (
              <div
                key={plan}
                className={`rounded-lg p-3 border ${
                  currentPlan === plan
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-800 bg-gray-800/40'
                }`}
              >
                <div className="text-lg mb-1">{planIcons[plan]}</div>
                <div className={`text-sm font-semibold capitalize ${currentPlan === plan ? 'text-purple-400' : 'text-gray-400'}`}>
                  {plan}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {plan === 'free' && 'Limited'}
                  {plan === 'basic' && '$9.99/mo'}
                  {plan === 'premium' && '$19.99/mo'}
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade / Manage Button */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                currentPlan === 'premium'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {currentPlan === 'premium' ? 'Manage Subscription' : 'Upgrade Plan'}
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Profile Information</h3>
            {!editing && (
              <button
                type="button"
                onClick={() => { setEditing(true); setProfileMsg(''); setProfileError(''); }}
                className="text-sm text-purple-400 hover:text-purple-300 transition"
              >
                Edit
              </button>
            )}
          </div>

          {profileMsg && <p className="text-green-400 text-sm mb-3">{profileMsg}</p>}
          {profileError && <p className="text-red-400 text-sm mb-3">{profileError}</p>}

          {editing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setName(user?.name || ''); setEmail(user?.email || ''); }}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Name</span>
                <span className="text-sm">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Email</span>
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Role</span>
                <span className="text-sm capitalize">{user?.role || 'user'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Member since</span>
                <span className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Password</h3>
            {!showPassword && (
              <button
                type="button"
                onClick={() => { setShowPassword(true); setPwMsg(''); setPwError(''); }}
                className="text-sm text-purple-400 hover:text-purple-300 transition"
              >
                Change Password
              </button>
            )}
          </div>

          {pwMsg && <p className="text-green-400 text-sm mb-3">{pwMsg}</p>}
          {pwError && <p className="text-red-400 text-sm mb-3">{pwError}</p>}

          {showPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500">••••••••</p>
          )}
        </div>

        {/* Watch History Summary */}
        {user?.watchHistory?.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-2">Watch History</h3>
            <p className="text-sm text-gray-400">
              You've watched <span className="text-purple-400 font-semibold">{user.watchHistory.length}</span> video{user.watchHistory.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
