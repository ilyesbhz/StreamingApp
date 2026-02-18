import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="text-lg font-semibold">{user?.name || 'User'}</div>
          <div className="text-gray-400">{user?.email}</div>
          <div className="text-gray-500 mt-2">Role: {user?.role || 'user'}</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
