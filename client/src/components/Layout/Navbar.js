import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

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
              {user && <Link to="/profile" className="hover:text-purple-400">Profile</Link>}
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
