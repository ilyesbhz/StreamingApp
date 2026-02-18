import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl">😔</div>
        <h2 className="text-2xl font-bold">Payment Cancelled</h2>
        <p className="text-gray-400">
          Your payment was not completed. No charges were made. You can try again whenever you're ready.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-sm font-medium transition"
          >
            View Plans
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
    </div>
  );
};

export default PaymentCancel;
