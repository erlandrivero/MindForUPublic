import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import { ObjectId } from "mongodb";

interface _Client {
  _id: ObjectId;
  email: string;
  userId?: string;
  transactions?: any[];
  purchases?: any[];
  paymentMethods?: any[];
}

export async function GET(_req: NextRequest) {
  try {
    // Get session to verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin users
    if (session.user.email !== "erlandrivero@gmail.com") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    // Connect to MongoDB
    await connectMongo();
    const db = mongoose.connection.db;
    const clientsCollection = db.collection("clients");
    
    // Find clients with transactions
    const clientsWithTransactions = await clientsCollection
      .find({ 
        "transactions": { $exists: true, $ne: [] } 
      })
      .limit(5)  // Limit to 5 results for safety
      .toArray();
    
    console.log(`Found ${clientsWithTransactions.length} clients with transactions`);
    
    // Find clients with payment methods
    const clientsWithPaymentMethods = await clientsCollection
      .find({ 
        "paymentMethods": { $exists: true, $ne: [] } 
      })
      .limit(5)  // Limit to 5 results for safety
      .toArray();
    
    console.log(`Found ${clientsWithPaymentMethods.length} clients with payment methods`);
    
    // Get user from database
    const userCollection = db.collection("users");
    const user = await userCollection.findOne({ 
      email: session.user.email 
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find client record for current user
    const userClient = await clientsCollection.findOne({
      $or: [
        { userId: user._id.toString() },
        { email: user.email }
      ]
    });
    
    // Process transactions and purchases for current user
    let allTransactions: any[] = [];
    let validTransactions: any[] = [];
    
    if (userClient) {
      // Combine transactions and purchases arrays
      allTransactions = [
        ...(userClient.transactions || []),
        ...(userClient.purchases || [])
      ];
      
      // Filter for valid transactions (paid and not cancelled)
      validTransactions = allTransactions.filter((t: any) => {
        // Check if transaction is paid
        const isPaid = t.payment_status === 'paid' || t.status === 'paid' || t.status === 'succeeded';
        
        // Check if transaction is NOT cancelled
        const isNotCancelled = !(t.cancelled || t.canceled || 
                             t.cancellation_details || 
                             t.cancelation_details || 
                             t.status === 'cancelled' || 
                             t.status === 'canceled');
        
        return isPaid && isNotCancelled;
      });
      
      // Sort transactions by date (newest first)
      if (validTransactions.length > 0) {
        validTransactions.sort((a: any, b: any) => {
          // Use various date fields, falling back as needed
          const dateA = a.createdAt || a.created || a.date || 0;
          const dateB = b.createdAt || b.created || b.date || 0;
          
          // Convert to timestamp and compare (newest first)
          const timeA = new Date(dateA).getTime();
          const timeB = new Date(dateB).getTime();
          return timeB - timeA;
        });
      }
    }
    
    return NextResponse.json({
      clientsWithTransactions: clientsWithTransactions.map(client => ({
        id: client._id.toString(),
        email: client.email,
        transactionCount: client.transactions?.length || 0,
        hasPaymentMethods: Array.isArray(client.paymentMethods) && client.paymentMethods.length > 0,
        paymentMethodCount: client.paymentMethods?.length || 0
      })),
      clientsWithPaymentMethods: clientsWithPaymentMethods.map(client => ({
        id: client._id.toString(),
        email: client.email,
        paymentMethodCount: client.paymentMethods?.length || 0,
        firstPaymentMethod: client.paymentMethods?.[0] || null
      })),
      currentUserClient: userClient ? {
        id: userClient._id.toString(),
        email: userClient.email,
        hasTransactions: Array.isArray(userClient.transactions) && userClient.transactions.length > 0,
        transactionCount: userClient.transactions?.length || 0,
        hasPurchases: Array.isArray(userClient.purchases) && userClient.purchases.length > 0,
        purchaseCount: userClient.purchases?.length || 0,
        hasPaymentMethods: Array.isArray(userClient.paymentMethods) && userClient.paymentMethods.length > 0,
        paymentMethodCount: userClient.paymentMethods?.length || 0,
        allTransactionsCount: allTransactions.length,
        validTransactionsCount: validTransactions.length,
        allTransactions: allTransactions.map((t: any) => ({
          id: t.id,
          amount: t.amount_total || t.amount,
          status: t.payment_status || t.status,
          created: t.createdAt || t.created || t.date,
          createdFormatted: new Date(t.createdAt || t.created || t.date).toISOString(),
          cancelled: t.cancelled || t.canceled || false,
          cancellation_details: t.cancellation_details || t.cancelation_details || null,
          source: t.source || (userClient.transactions?.includes(t) ? 'transactions' : 'purchases')
        })),
        validTransactions: validTransactions.map((t: any) => ({
          id: t.id,
          amount: t.amount_total || t.amount,
          status: t.payment_status || t.status,
          created: t.createdAt || t.created || t.date,
          createdFormatted: new Date(t.createdAt || t.created || t.date).toISOString(),
          source: t.source || (userClient.transactions?.includes(t) ? 'transactions' : 'purchases')
        })),
        latestValidTransaction: validTransactions.length > 0 ? {
          id: validTransactions[0].id,
          amount: validTransactions[0].amount_total || validTransactions[0].amount,
          amountNormalized: (validTransactions[0].amount_total || validTransactions[0].amount) > 1000 ? 
            (validTransactions[0].amount_total || validTransactions[0].amount) / 100 : 
            (validTransactions[0].amount_total || validTransactions[0].amount),
          status: validTransactions[0].payment_status || validTransactions[0].status,
          created: validTransactions[0].createdAt || validTransactions[0].created || validTransactions[0].date,
          createdFormatted: new Date(validTransactions[0].createdAt || validTransactions[0].created || validTransactions[0].date).toISOString(),
          source: validTransactions[0].source || (userClient.transactions?.includes(validTransactions[0]) ? 'transactions' : 'purchases')
        } : null
      } : null
    });
  } catch (error) {
    console.error("Error in debug clients API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
