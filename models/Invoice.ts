import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// INVOICE SCHEMA
const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stripeInvoiceId: {
      type: String,
      required: true,
      unique: true,
      // Removed validation that requires 'in_' prefix since we're using client transaction IDs
    },
    number: {
      type: String,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "open", "paid", "uncollectible", "void"],
    },
    invoiceDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    periodStart: {
      type: Date,
    },
    periodEnd: {
      type: Date,
    },
    subtotal: {
      type: Number,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    invoiceUrl: {
      type: String,
    },
    invoicePdf: {
      type: String,
    },
    paymentMethodId: {
      type: String,
    },
    lines: {
      type: Array,
      default: [],
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
invoiceSchema.plugin(toJSON);

// Create indexes for faster queries
invoiceSchema.index({ userId: 1, invoiceDate: -1 });
invoiceSchema.index({ stripeInvoiceId: 1 });

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
