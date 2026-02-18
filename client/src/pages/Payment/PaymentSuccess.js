import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState(null);
  const verifyCalledRef = useRef(false);

  useEffect(() => {
    // Prevent double-call in React strict mode
    if (verifyCalledRef.current) return;
    verifyCalledRef.current = true;

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post('/subscriptions/verify-payment', { sessionId });
        setSubscription(res.data.subscription);
        setStatus('success');
        setMessage(res.data.message);

        // Refresh user data in context
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Payment verification failed.');
      }
    };

    verify();
  }, [searchParams, setUser]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-semibold">Verifying your payment...</h2>
            <p className="text-gray-400 text-sm">Please wait while we confirm your subscription.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-green-400">Payment Successful!</h2>
            <p className="text-gray-300">{message}</p>
            {subscription && (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-sm space-y-2 mt-4">
                <p>
                  <span className="text-gray-400">Plan:</span>{' '}
                  <span className="font-semibold capitalize text-purple-400">{subscription.plan}</span>
                </p>
                <p>
                  <span className="text-gray-400">Valid until:</span>{' '}
                  <span className="font-semibold">
                    {new Date(subscription.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Start Watching
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                View Profile
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-red-400">Payment Verification Failed</h2>
            <p className="text-gray-400">{message}</p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
