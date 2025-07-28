import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import configFile from "@/config";
import User from "@/models/User";
import { findCheckoutSession } from "@/libs/stripe";
import { MongoClient } from "mongodb";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// It's used to update user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  console.log('⚡ STRIPE WEBHOOK: Received webhook request');
  await connectMongo();
  console.log('✅ STRIPE WEBHOOK: MongoDB connected');

  const body = await req.text();
  console.log(`📦 STRIPE WEBHOOK: Request body received (${body.length} chars)`);

  const signature = headers().get("stripe-signature");
  if (!signature) {
    console.error('❌ STRIPE WEBHOOK ERROR: Stripe signature is missing from headers');
    throw new Error("Stripe signature is missing from headers.");
  }
  console.log('✅ STRIPE WEBHOOK: Signature header found');
  
  if (!webhookSecret) {
    console.error('❌ STRIPE WEBHOOK ERROR: STRIPE_WEBHOOK_SECRET is not set in environment variables');
    throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables.");
  }
  console.log('✅ STRIPE WEBHOOK: Webhook secret found');


  let event;

  // verify Stripe event is legit
  try {
    console.log('🔐 STRIPE WEBHOOK: Attempting to verify webhook signature...');
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`✅ STRIPE WEBHOOK: Signature verified successfully! Event type: ${event.type}`);
  } catch (err) {
    console.error(`❌ STRIPE WEBHOOK ERROR: Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const eventType = event.type;
  console.log(`🎯 STRIPE WEBHOOK: Processing event type: ${eventType}`);

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);
        if (!session) {
          throw new Error("Stripe session not found.");
        }
        const customerId = session.customer;
        if (!session.line_items || !session.line_items.data[0] || !session.line_items.data[0].price) {
          throw new Error("Stripe line items or price not found in session.");
        }
        const priceId = session.line_items.data[0].price.id;
        const userId = stripeObject.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        let user;

        // Get or create the user. userId is normally passed in the checkout session (clientReferenceID) to identify the user when we get the webhook event
        if (userId) {
          user = await User.findById(userId);
        } else if (customer.email) {
          user = await User.findOne({ email: customer.email });

          if (!user) {
            user = await User.create({
              email: customer.email,
              name: customer.name,
            });

            await user.save();
          }
        } else {
          console.error("No user found");
          throw new Error("No user found");
        }

        // Update user data + Grant user access to your product. It's a boolean in the database, but could be a number of credits, etc...
        user.priceId = priceId;
        user.customerId = customerId;
        user.hasAccess = true;
        await user.save();

        // Extra: send email with user link, product page, etc...
        // try {
        //   await sendEmail(...);
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, but you can send an email to the user to remind them to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Subscription ending soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        const stripeObject: Stripe.Subscription = event.data
          .object as Stripe.Subscription;

        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );
        const user = await User.findOne({ customerId: subscription.customer });

        // Revoke access to your product
        user.hasAccess = false;
        await user.save();

        break;
      }

      case "invoice.paid": {
        console.log(`💰 STRIPE WEBHOOK: Processing invoice.paid event`);
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product

        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;

        if (!stripeObject.lines || !stripeObject.lines.data[0] || !stripeObject.lines.data[0].price) {
          throw new Error("Invoice line items or price not found.");
        }
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        console.log(`🔍 STRIPE WEBHOOK: Looking for user with customerId: ${customerId}`);
        const user = await User.findOne({ customerId });

        if (!user) {
          console.error(`❌ STRIPE WEBHOOK ERROR: No user found with customerId: ${customerId}`);
          break;
        }
        console.log(`✅ STRIPE WEBHOOK: Found user: ${user.email} (${user._id})`);

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (user.priceId !== priceId) {
          console.log(`⚠️ STRIPE WEBHOOK: Invoice priceId (${priceId}) doesn't match user's priceId (${user.priceId}), skipping`);
          break;
        }
        console.log(`✅ STRIPE WEBHOOK: Invoice priceId matches user's subscription`);

        // Grant user access to your product. It's a boolean in the database, but could be a number of credits, etc...
        user.hasAccess = true;
        await user.save();

        // Store transaction data in clients collection
        console.log(`💾 STRIPE WEBHOOK: Storing transaction data for invoice ${stripeObject.id} in clients collection`);
        console.log(`🔑 STRIPE WEBHOOK: MONGODB_URI defined: ${!!process.env.MONGODB_URI}`);
        const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
        try {
          await mongoClient.connect();
          console.log(`✅ STRIPE WEBHOOK: Connected to MongoDB directly`);
        } catch (mongoConnectError) {
          console.error(`❌ STRIPE WEBHOOK ERROR: Failed to connect to MongoDB: ${mongoConnectError.message}`);
          throw mongoConnectError;
        }
        
        try {
          const database = mongoClient.db();
          const clientsCollection = database.collection('clients');
          
          // Find the plan details based on the priceId
          const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);
          
          // Find or create client record for this user
          let client = await clientsCollection.findOne({ 
            userId: user._id 
          });
          
          if (!client) {
            // Create new client record if none exists
            console.log(`Creating new client record for user ${user.email}`);
          } else {
            console.log(`Found existing client record for user ${user.email}`);
          }
          
          // Add new transaction from Stripe invoice
          const transaction = {
            id: stripeObject.id,
            date: new Date(stripeObject.created * 1000), // Convert timestamp to date
            amount: stripeObject.amount_paid / 100, // Convert cents to dollars
            currency: stripeObject.currency,
            status: 'paid',
            description: `Payment for ${plan?.name || 'subscription'}`,
            receiptUrl: stripeObject.hosted_invoice_url,
            receiptPdf: stripeObject.invoice_pdf
          };
          
          console.log(`Created transaction record:`, transaction);
          
          // Use $push to add transaction to array (creates array if it doesn't exist)
          // This is more reliable than replacing the entire client document
          const updateResult = await clientsCollection.updateOne(
            { userId: user._id },
            { 
              $set: { 
                updatedAt: new Date(),
                // If client doesn't exist yet, set these fields
                name: client?.name || user.name || 'Customer',
                email: client?.email || user.email
              },
              $push: { 
                transactions: transaction 
              }
            },
            { upsert: true }
          );
          
          console.log(`Update result:`, updateResult);
          console.log(`Successfully stored transaction ${transaction.id} for user ${user.email}`);
          
          // Now generate invoice from the new transaction data
          console.log(`Generating invoice from transaction ${transaction.id}`);
          try {
            // Call the invoice API internally to generate an invoice
            // We're using the same logic as the POST handler in app/api/dashboard/invoices/route.ts
            // but calling it directly to avoid HTTP overhead
            const { default: Invoice } = await import('@/models/Invoice');
            
            // Create invoice data from transaction
            const invoiceData = {
              userId: user._id,
              stripeInvoiceId: transaction.id,
              number: `INV-${transaction.id.substring(0, 8)}`,
              description: transaction.description || `Payment - ${client?.name || user.name || 'Customer'}`,
              amount: transaction.amount || 0,
              total: transaction.amount || 0,
              currency: transaction.currency || 'usd',
              status: transaction.status || 'paid',
              invoiceDate: transaction.date || new Date(),
              invoiceUrl: transaction.receiptUrl || '',
              invoicePdf: transaction.receiptPdf || '',
              metadata: {
                clientId: client?._id?.toString() || '',
                clientName: client?.name || user.name || 'Unknown Client',
                source: 'stripe_webhook_transaction'
              }
            };
            
            console.log('Created invoice data:', invoiceData);
            
            // Check if this invoice already exists
            console.log(`Checking if invoice with stripeInvoiceId ${transaction.id} already exists...`);
            const existingInvoice = await Invoice.findOne({ stripeInvoiceId: transaction.id });
            
            if (!existingInvoice) {
              console.log('No existing invoice found, creating new one...');
              // Create new invoice document
              const newInvoice = new Invoice(invoiceData);
              
              try {
                console.log('Validating invoice before save...');
                await newInvoice.validate();
                console.log('Invoice validation passed');
                
                console.log('Saving invoice to MongoDB...');
                await newInvoice.save();
                console.log(`Saved invoice ${transaction.id} to MongoDB with _id: ${newInvoice._id}`);
              } catch (validationError) {
                console.error('Invoice validation failed:', validationError);
              }
            } else {
              console.log(`Existing invoice found with _id: ${existingInvoice._id}, updating...`);
              // Update existing invoice
              await Invoice.findByIdAndUpdate(existingInvoice._id, invoiceData);
              console.log(`Updated existing invoice ${transaction.id} in MongoDB`);
            }
          } catch (invoiceError) {
            console.error(`Error generating invoice from transaction:`, invoiceError);
          }
        } catch (error) {
          console.error(`Error storing transaction data:`, error);
        } finally {
          // Close MongoDB connection
          await mongoClient.close();
          console.log('MongoDB client connection closed');
        }

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error(`❌ STRIPE WEBHOOK ERROR: Error processing event: ${e.message}`);
    console.error(e);
  }

  console.log('✅ STRIPE WEBHOOK: Successfully processed webhook event');
  return NextResponse.json({ received: true });
}
