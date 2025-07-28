import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // Dashboard-specific fields
    profile: {
      phone: { type: String, trim: true },
      company: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true, default: 'United States' },
      timezone: { type: String, trim: true, default: 'America/New_York' },
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      twoFactorEnabled: { type: Boolean, default: false }
    },
    // Notification preferences
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      callAlerts: { type: Boolean, default: true },
      billingAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    },
    // Usage tracking
    usage: {
      minutesUsed: { type: Number, default: 0 },
      minutesLimit: { type: Number, default: 0 },
      callsThisMonth: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now }
    },
    // Subscription details (complementing Stripe data)
    subscription: {
      planName: { type: String },
      status: { type: String, enum: ['active', 'inactive', 'canceled', 'past_due'], default: 'inactive' },
      currentPeriodStart: { type: Date },
      currentPeriodEnd: { type: Date },
      billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
