import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// PAYMENT METHOD SCHEMA
const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stripePaymentMethodId: {
      type: String,
      required: true,
      unique: true,
      validate(value: string) {
        return value.includes("pm_");
      },
    },
    type: {
      type: String,
      required: true,
      enum: ["card", "sepa_debit", "bank_account"],
      default: "card",
    },
    brand: {
      type: String,
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    expiryMonth: {
      type: Number,
      required: function() {
        return this.type === "card";
      },
    },
    expiryYear: {
      type: Number,
      required: function() {
        return this.type === "card";
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    billingDetails: {
      name: String,
      email: String,
      phone: String,
      address: {
        city: String,
        country: String,
        line1: String,
        line2: String,
        postal_code: String,
        state: String,
      },
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
paymentMethodSchema.plugin(toJSON);

// Create indexes for faster queries
paymentMethodSchema.index({ userId: 1, isDefault: 1 });

export default mongoose.models.PaymentMethod || mongoose.model("PaymentMethod", paymentMethodSchema);
