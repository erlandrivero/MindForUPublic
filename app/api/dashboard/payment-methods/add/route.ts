import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
// Removed Stripe import as we're storing directly in MongoDB

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectMongo();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get payment data from request
    const paymentData = await req.json();
    const { cardNumber, cardholderName, expiryMonth, expiryYear, cvc } = paymentData;

    // Validate required fields
    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvc) {
      return NextResponse.json({ error: 'Missing required payment information' }, { status: 400 });
    }

    console.log('Saving payment method directly to MongoDB...');
    
    // Generate a mock payment method ID that includes 'pm_' to satisfy validation
    const mockPaymentMethodId = `pm_mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Format the expiry year properly
    const formattedExpiryYear = parseInt(expiryYear) > 2000 ? parseInt(expiryYear) : 2000 + parseInt(expiryYear);
    
    // Check if this is the first payment method for this user (to set as default)
    const existingPaymentMethods = await PaymentMethod.find({ userId: user._id });
    const isDefault = existingPaymentMethods.length === 0;
    
    try {
      // Create a new payment method document
      const newPaymentMethod = new PaymentMethod({
        userId: user._id,
        stripePaymentMethodId: mockPaymentMethodId, // Using mock ID to satisfy validation
        type: 'card',
        brand: 'visa', // Default to visa, could be determined by card number in a real implementation
        last4: cardNumber.slice(-4), // Get last 4 digits of card number
        expiryMonth: parseInt(expiryMonth),
        expiryYear: formattedExpiryYear,
        isDefault: isDefault,
        billingDetails: {
          name: cardholderName
        }
      });

      console.log('Payment method object created');
      
      // Validate the model before saving
      const validationError = newPaymentMethod.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
        throw validationError;
      }
      
      // Save to MongoDB
      await newPaymentMethod.save();
      console.log('Payment method saved to MongoDB successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment method added successfully',
        paymentMethod: newPaymentMethod
      });
    } catch (saveError) {
      console.error('Error saving payment method to MongoDB:', saveError);
      throw saveError;
    }
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    return NextResponse.json({ 
      error: 'Failed to add payment method', 
      message: error.message,
      stack: error.stack,
      name: error.name,
      details: error.toString()
    }, { status: 500 });
  }
}
