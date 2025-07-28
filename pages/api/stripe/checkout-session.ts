import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { priceId, quantity = 1, customerEmail } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required.' });
    }

    try {
      // Determine plan name based on priceId for metadata
      let planName = 'Starter Plan';
      if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) {
        planName = 'Professional Plan';
      } else if (priceId === process.env.STRIPE_PRICE_BUSINESS) {
        planName = 'Business Plan';
      } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) {
        planName = 'Enterprise Plan';
      } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_PLUS) {
        planName = 'Enterprise Plus Plan';
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        line_items: [
          {
            price: priceId,
            quantity: quantity,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
        metadata: {
          planName: planName
        }
      };

      // If customer email is provided, add it to the session
      if (customerEmail) {
        sessionParams.customer_email = customerEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.status(200).json({ sessionId: session.id });
    } catch (err: unknown) {
      if (err instanceof Error) {
      console.error('Error creating checkout session:', err);
      res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'An unexpected error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
