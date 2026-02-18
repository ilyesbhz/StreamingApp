import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    icon: '🆓',
    color: 'border-gray-700',
    features: [
      'Limited content access',
      'Standard quality',
      'Ad-supported',
      '1 device at a time'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: '/month',
    icon: '⭐',
    color: 'border-blue-500',
    popular: false,
    features: [
      'Full content library',
      'HD quality',
      'No ads',
      '2 devices at a time',
      'Download for offline'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99',
    period: '/month',
    icon: '👑',
    color: 'border-yellow-500',
    popular: true,
    features: [
      'Full content library',
      '4K Ultra HD',
      'No ads',
      '4 devices at a time',
      'Download for offline',
      'Early access to new content',
      'Exclusive behind-the-scenes'
    ]
  }
];

const Pricing = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const currentPlan = user?.subscription?.plan || 'free';

  const handleSubscribe = async (planId) => {
    if (planId === 'free' || planId === currentPlan) return;

    setLoading(planId);
    setError('');

    try {
      const res = await api.post('/subscriptions/create-checkout', { plan: planId });

      // Redirect to Stripe Checkout
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) return;

    setLoading('cancel');
    setError('');
    try {
      await api.post('/subscriptions/cancel');
      // Refresh user data
      const res = await api.get('/auth/me');
      setUser(res.data);
      setLoading(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling subscription');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Unlock the full StreamX experience. Pick a plan that works for you. 
            Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-900/40 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const isDowngrade = (currentPlan === 'premium' && plan.id === 'basic');

            return (
              <div
                key={plan.id}
                className={`relative bg-gray-900 rounded-2xl p-6 border-2 transition-all ${
                  isCurrent
                    ? 'border-purple-500 shadow-lg shadow-purple-500/10'
                    : plan.popular
                      ? `${plan.color} shadow-lg shadow-yellow-500/5`
                      : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      CURRENT PLAN
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 mt-2">
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="mt-auto">
                  {plan.id === 'free' ? (
                    isCurrent ? (
                      <div className="text-center text-sm text-gray-500 py-2">
                        Your current plan
                      </div>
                    ) : null
                  ) : isCurrent ? (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading === 'cancel'}
                      className="w-full py-2.5 rounded-lg text-sm font-medium border border-red-800 text-red-400 hover:bg-red-900/30 transition disabled:opacity-50"
                    >
                      {loading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading === plan.id || isDowngrade}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                        plan.popular
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {loading === plan.id
                        ? 'Redirecting to checkout...'
                        : isDowngrade
                          ? 'Cancel first to downgrade'
                          : `Upgrade to ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Test Mode Notice */}
        <div className="text-center bg-gray-900 rounded-xl p-6 border border-gray-800 max-w-lg mx-auto">
          <h4 className="font-semibold mb-2 text-yellow-400">🧪 Test Mode</h4>
          <p className="text-sm text-gray-400 mb-3">
            Stripe is in test mode. Use the following test card to try payments:
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-left text-sm space-y-1">
            <p><span className="text-gray-500">Card number:</span> <span className="font-mono text-green-400">4242 4242 4242 4242</span></p>
            <p><span className="text-gray-500">Expiry:</span> <span className="font-mono text-green-400">any future date (e.g. 12/34)</span></p>
            <p><span className="text-gray-500">CVC:</span> <span className="font-mono text-green-400">any 3 digits (e.g. 123)</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
