import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import { ObjectId } from "mongodb";

interface Client {
  _id: ObjectId;
  email: string;
  userId?: string;
  transactions?: any[];
  paymentMethods?: any[];
}

export async function GET(req: NextRequest) {
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
        hasPaymentMethods: Array.isArray(userClient.paymentMethods) && userClient.paymentMethods.length > 0,
        paymentMethodCount: userClient.paymentMethods?.length || 0
      } : null
    });
  } catch (error) {
    console.error("Error in debug clients API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
