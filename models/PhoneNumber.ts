import mongoose, { Schema } from 'mongoose';

// Define the PhoneNumber schema
const PhoneNumberSchema = new Schema(
  {
    vapiPhoneNumberId: {
      type: String,
      required: true,
      unique: true,
    },
    number: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'active',
    },
    areaCode: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assistantId: {
      type: Schema.Types.ObjectId,
      ref: 'Assistant',
    },
    vapiAssistantId: {
      type: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model if it doesn't exist, otherwise use the existing one
const PhoneNumber = mongoose.models.PhoneNumber || mongoose.model('PhoneNumber', PhoneNumberSchema);

export default PhoneNumber;
