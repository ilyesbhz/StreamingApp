import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-10">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          <span className="text-white">Login to </span>
          <span className="text-purple-500">StreamX</span>
        </h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded"
          >
            Login
          </button>
        </form>
        
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-500 hover:underline">
            Register
          </Link>
        </p>
      </div>

      <div className="w-full max-w-3xl mt-8">
        <h3 className="text-2xl font-bold text-center mb-6">Available Plans</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-gray-900 rounded-lg p-6 border border-purple-600">
            <h4 className="text-lg font-semibold mb-2">Free</h4>
            <p className="text-3xl font-bold mb-4">$0</p>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Limited library access</li>
              <li>Ads included</li>
              <li>Standard quality</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-purple-600">
            <h4 className="text-lg font-semibold mb-2">Basic</h4>
            <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm text-gray-400">/mo</span></p>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Full library access</li>
              <li>No ads</li>
              <li>HD quality</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-purple-600">
            <h4 className="text-lg font-semibold mb-2">Premium</h4>
            <p className="text-3xl font-bold mb-4">$19.99<span className="text-sm text-gray-400">/mo</span></p>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Everything in Basic</li>
              <li>No ads</li>
              <li>Ultra HD quality</li>
              <li>Multiple profiles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;