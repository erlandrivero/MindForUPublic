# Stripe Subscription Process Flow Documentation

## Overview
This document outlines the step-by-step process of how the Stripe subscription system works in the MindForU application, from the moment a user selects a plan to when their subscription is active and invoices are generated.

## 1. User Selects a Plan (Frontend)
- The process begins in the `Pricing.tsx` component, which displays available subscription plans from `config.ts`
- Each plan has details like name, description, price, and most importantly, a `priceId` that corresponds to a product in your Stripe dashboard
- The user clicks on a plan, which triggers the `ButtonCheckout` component with the selected plan's `priceId`

## 2. Checkout Button Initiates Stripe Session (Frontend to API)
- When clicked, the `ButtonCheckout` component makes a POST request to `/api/stripe/create-checkout`
- It passes the following parameters:
  - `priceId`: The Stripe price ID for the selected plan
  - `mode`: "subscription" for recurring billing
  - `successUrl`: Where to redirect after successful payment
  - `cancelUrl`: Where to redirect if the user cancels

## 3. API Creates Stripe Checkout Session (Backend)
- The `/api/stripe/create-checkout/route.ts` endpoint receives the request
- It checks if the user is logged in via NextAuth session
- If logged in, it retrieves the user from MongoDB to get their customer ID
- It calls the `createCheckout` function from `libs/stripe.ts` with:
  - The selected plan's `priceId`
  - User information (if available)
  - Success and cancel URLs
- The `createCheckout` function:
  - Initializes Stripe with your secret key
  - Sets up parameters for the checkout session:
    - If the user has a Stripe customer ID, it uses that
    - Otherwise, it creates a new customer
    - It adds the selected price to the line items
  - Creates a Stripe checkout session
  - Returns the session URL

## 4. User Completes Payment on Stripe Hosted Page
- The frontend redirects the user to the Stripe-hosted checkout page
- User enters payment details and completes the subscription
- Stripe processes the payment and creates a subscription
- User is redirected to the `successUrl` specified earlier

## 5. Stripe Sends Webhook Event (Stripe to Backend)
- Stripe sends a webhook event to your `/api/webhook/stripe` endpoint
- The webhook handler in `app/api/webhook/stripe/route.ts`:
  - Verifies the webhook signature using your webhook secret
  - Processes different event types

## 6. Webhook Handler Updates User Data (Backend)
- For `checkout.session.completed` events:
  - Retrieves the checkout session details
  - Finds the corresponding plan in your config
  - Gets or creates the user in your database
  - Updates the user with:
    - `priceId`: The Stripe price ID
    - `customerId`: The Stripe customer ID
    - `hasAccess`: Set to true to grant access
  - Saves the updated user to MongoDB

- For `invoice.paid` events (recurring payments):
  - Verifies the payment is for the correct subscription
  - Updates the user's access status

- For `customer.subscription.deleted` events:
  - Revokes the user's access by setting `hasAccess` to false

## 7. Transaction Data Flow to Invoices
- When Stripe processes a payment, it creates an invoice
- Your webhook handler can extract this invoice data
- This data should be stored in your `clients` collection with transaction details
- Your invoices API then creates invoice documents from these transactions
- These invoices are displayed in the billing management page

## Key Files
- Frontend:
  - `components/Pricing.tsx` - Displays subscription plans
  - `components/ButtonCheckout.tsx` - Initiates checkout process
  
- Backend:
  - `app/api/stripe/create-checkout/route.ts` - Creates Stripe checkout session
  - `app/api/webhook/stripe/route.ts` - Handles Stripe webhook events
  - `libs/stripe.ts` - Contains Stripe utility functions
  
- Configuration:
  - `config.ts` - Contains Stripe plan configurations

## Debugging Tips
1. Check Stripe Dashboard for successful payments and subscription status
2. Verify webhook events are being received (check Stripe dashboard for webhook delivery)
3. Inspect MongoDB for updated user data after subscription
4. Check client transactions in MongoDB to ensure they're being created
5. Verify invoice creation from transactions in the invoices collection
