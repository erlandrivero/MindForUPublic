"use client";

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

interface Product {
  id: string;
  name: string;
  priceId: string;
  price: number;
  currency: string;
  features: string[];
}

const products: Product[] = [
  {
    id: 'prod_starter',
    name: 'Starter Plan',
    priceId: 'price_1Rk7XePolIihCLBaGS6oTCPF',
    price: 9900, // $99.00 in cents
    currency: 'usd',
    features: ['Basic voice AI', 'Standard support', '30-day usage window', '80 minutes'],
  },
  {
    id: 'prod_professional',
    name: 'Professional Plan',
    priceId: 'price_1Rk7YcPolIihCLBacMvpJNqS',
    price: 24900, // $249.00 in cents
    currency: 'usd',
    features: ['Advanced voice AI', 'Priority support', '60-day usage window', 'Basic analytics', '250 minutes'],
  },
  {
    id: 'prod_business',
    name: 'Business Plan',
    priceId: 'price_1Rk7bFPolIihCLBaollaNxW0',
    price: 49900, // $499.00 in cents
    currency: 'usd',
    features: ['Premium voice AI', 'Dedicated support', '90-day usage window', 'Advanced analytics', 'Custom integrations', '600 minutes'],
  },
  {
    id: 'prod_enterprise',
    name: 'Enterprise Plan',
    priceId: 'price_1Rk7dePolIihCLBamIyBPcTm',
    price: 99900, // $999.00 in cents
    currency: 'usd',
    features: ['Enterprise voice AI', '24/7 support', '120-day usage window', 'White-label options', 'Custom development', '1,500 minutes'],
  },
  {
    id: 'prod_enterprise_plus',
    name: 'Enterprise Plus',
    priceId: 'price_1Rk7f3PolIihCLBanYQALl0n',
    price: 199900, // $1,999.00 in cents
    currency: 'usd',
    features: ['All Enterprise features plus dedicated infrastructure', 'SLA guarantees', 'Unlimited integrations', '3,500 minutes'],
  },
];

const PricingTable: React.FC = () => {
  const handleCheckout = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (response.ok) {
        const stripe = await stripePromise;
        if (stripe) {
          stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
          console.error('Stripe.js failed to load.');
        }
      } else {
        console.error('Error from API:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  return (
    <section id="pricing" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="sm:text-5xl text-4xl font-extrabold text-base-content text-center mb-12">Our Pricing Plans</h2>
        <div className="relative flex justify-center flex-wrap lg:flex-nowrap items-center lg:items-stretch gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center h-full w-full lg:w-1/5 flex-shrink-0 min-h-[500px]">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h3>
              <div className="text-4xl font-extrabold text-[#18C5C2] mb-6">
                ${(product.price / 100).toFixed(2)}
                <span className="text-xl font-medium text-gray-600">/{product.currency}</span>
              </div>
              <ul className="text-gray-600 mb-8 flex-grow space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-left text-base text-gray-800 font-normal">
                    <div className="flex-shrink-0 w-5 h-5 mr-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(product.priceId)}
                className="mt-auto bg-[#18C5C2] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1A7F6B] transition duration-300"
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingTable;
