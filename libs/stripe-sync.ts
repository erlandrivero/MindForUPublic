import Stripe from "stripe";
import User from "@/models/User";
import PaymentMethod from "@/models/PaymentMethod";
import Invoice from "@/models/Invoice";
import { Types } from "mongoose";

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
  typescript: true,
});

/**
 * Sync payment methods for a user from Stripe to MongoDB
 */
export const syncPaymentMethods = async (userId: string | Types.ObjectId) => {
  try {
    // Find the user to get their Stripe customerId
    const user = await User.findById(userId);
    
    if (!user || !user.customerId) {
      console.log(`User ${userId} not found or has no Stripe customerId`);
      return { success: false, message: "User not found or has no Stripe customer ID" };
    }
    
    console.log(`Syncing payment methods for user ${userId} with Stripe customerId ${user.customerId}`);
    
    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.customerId,
      type: 'card',
      limit: 100,
    });
    
    console.log(`Found ${paymentMethods.data.length} payment methods in Stripe`);
    
    // Get the default payment method for this customer
    const customer = await stripe.customers.retrieve(user.customerId);
    const defaultPaymentMethodId = typeof customer !== 'string' ? customer.invoice_settings?.default_payment_method : null;
    
    // Process each payment method
    for (const pm of paymentMethods.data) {
      // Check if this payment method already exists in our database
      const existingPM = await PaymentMethod.findOne({ stripePaymentMethodId: pm.id });
      
      // Extract card details
      const card = pm.card;
      if (!card) continue;
      
      const paymentMethodData = {
        userId: user._id,
        stripePaymentMethodId: pm.id,
        type: pm.type,
        brand: card.brand,
        last4: card.last4,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
        billingDetails: pm.billing_details,
        metadata: pm.metadata,
      };
      
      if (existingPM) {
        // Update existing payment method
        console.log(`Updating existing payment method ${pm.id}`);
        await PaymentMethod.findByIdAndUpdate(existingPM._id, paymentMethodData);
      } else {
        // Create new payment method
        console.log(`Creating new payment method ${pm.id}`);
        await PaymentMethod.create(paymentMethodData);
      }
    }
    
    // Handle deleted payment methods (those in our DB but not in Stripe)
    const ourPaymentMethods = await PaymentMethod.find({ userId: user._id });
    const stripePaymentMethodIds = paymentMethods.data.map(pm => pm.id);
    
    for (const ourPM of ourPaymentMethods) {
      if (!stripePaymentMethodIds.includes(ourPM.stripePaymentMethodId)) {
        console.log(`Removing payment method ${ourPM.stripePaymentMethodId} as it no longer exists in Stripe`);
        await PaymentMethod.findByIdAndDelete(ourPM._id);
      }
    }
    
    return { 
      success: true, 
      count: paymentMethods.data.length,
      message: `Successfully synced ${paymentMethods.data.length} payment methods` 
    };
  } catch (error) {
    console.error("Error syncing payment methods:", error);
    return { 
      success: false, 
      message: `Error syncing payment methods: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Sync invoices for a user from Stripe to MongoDB
 */
export const syncInvoices = async (userId: string | Types.ObjectId) => {
  try {
    // Find the user to get their Stripe customerId
    const user = await User.findById(userId);
    
    if (!user || !user.customerId) {
      console.log(`User ${userId} not found or has no Stripe customerId`);
      return { success: false, message: "User not found or has no Stripe customer ID" };
    }
    
    console.log(`Syncing invoices for user ${userId} with Stripe customerId ${user.customerId}`);
    
    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.customerId,
      limit: 100,
      expand: ['data.payment_intent'],
    });
    
    console.log(`Found ${invoices.data.length} invoices in Stripe`);
    
    // Process each invoice
    for (const inv of invoices.data) {
      // Check if this invoice already exists in our database
      const existingInvoice = await Invoice.findOne({ stripeInvoiceId: inv.id });
      
      // Get payment method ID if available
      let paymentMethodId = null;
      if (inv.payment_intent && typeof inv.payment_intent !== 'string' && inv.payment_intent.payment_method) {
        paymentMethodId = typeof inv.payment_intent.payment_method === 'string' 
          ? inv.payment_intent.payment_method 
          : inv.payment_intent.payment_method.id;
      }
      
      const invoiceData = {
        userId: user._id,
        stripeInvoiceId: inv.id,
        number: inv.number,
        description: inv.description || `Invoice ${inv.number}`,
        amount: inv.amount_due,
        currency: inv.currency,
        status: inv.status,
        invoiceDate: new Date(inv.created * 1000),
        dueDate: inv.due_date ? new Date(inv.due_date * 1000) : undefined,
        paidAt: inv.status === 'paid' && inv.status_transitions.paid_at 
          ? new Date(inv.status_transitions.paid_at * 1000) 
          : undefined,
        periodStart: inv.period_start ? new Date(inv.period_start * 1000) : undefined,
        periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : undefined,
        subtotal: inv.subtotal,
        tax: inv.tax || 0,
        total: inv.total,
        invoiceUrl: inv.hosted_invoice_url || '',
        invoicePdf: inv.invoice_pdf || '',
        paymentMethodId,
        lines: inv.lines.data,
        metadata: inv.metadata,
      };
      
      if (existingInvoice) {
        // Update existing invoice
        console.log(`Updating existing invoice ${inv.id}`);
        await Invoice.findByIdAndUpdate(existingInvoice._id, invoiceData);
      } else {
        // Create new invoice
        console.log(`Creating new invoice ${inv.id}`);
        await Invoice.create(invoiceData);
      }
    }
    
    return { 
      success: true, 
      count: invoices.data.length,
      message: `Successfully synced ${invoices.data.length} invoices` 
    };
  } catch (error) {
    console.error("Error syncing invoices:", error);
    return { 
      success: false, 
      message: `Error syncing invoices: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Sync both payment methods and invoices for a user
 */
export const syncStripeData = async (userId: string | Types.ObjectId) => {
  const paymentMethodsResult = await syncPaymentMethods(userId);
  const invoicesResult = await syncInvoices(userId);
  
  return {
    paymentMethods: paymentMethodsResult,
    invoices: invoicesResult,
    success: paymentMethodsResult.success && invoicesResult.success
  };
};
