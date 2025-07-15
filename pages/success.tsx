import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SuccessPage: React.FC = () => {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session_id) {
      // In a real application, you might want to verify the session_id with your backend
      // to confirm the payment and fetch order details.
      setMessage('Payment successful! Your purchase has been completed.');
      setLoading(false);
    } else {
      setMessage('No session ID found. Please check your purchase status.');
      setLoading(false);
    }
  }, [session_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Success!</h1>
      <p className="text-lg text-gray-800 text-center mb-8">{message}</p>
      <button
        onClick={() => router.push('/')}
        className="bg-[#18C5C2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1A7F6B] transition duration-300"
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default SuccessPage;
