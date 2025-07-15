import React from 'react';
import { useRouter } from 'next/router';

const CancelPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
      <p className="text-lg text-gray-800 text-center mb-8">Your payment was cancelled. You can try again or contact support if you have any questions.</p>
      <button
        onClick={() => router.push('/')}
        className="bg-gray-500 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-600 transition duration-300"
      >
        Go to Homepage
      </button>
    </div>
  );
};

export default CancelPage;
