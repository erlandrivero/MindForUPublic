import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAssistant extends Document {
  userId: mongoose.Types.ObjectId;
  vapiAssistantId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training';
  type: 'customer_service' | 'sales' | 'scheduling' | 'general';
  configuration: {
    voice?: string;
    model?: string;
    firstMessage?: string;
    systemPrompt?: string;
    functions?: any[];
  };
  phoneNumber?: {
    id: string;
    number: string;
    status: string;
    areaCode?: string;
  };
  statistics: {
    totalCalls: number;
    callsToday: number;
    avgDuration: number;
    successRate: number;
    lastActive?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AssistantSchema = new Schema<IAssistant>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  vapiAssistantId: { 
    type: String, 
    required: true,
    unique: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'training'],
    default: 'inactive' 
  },
  type: { 
    type: String, 
    enum: ['customer_service', 'appointment_scheduling', 'sales_qualification', 'general_assistant', 'technical_support'],
    required: true 
  },
  configuration: {
    voice: { type: String },
    model: { type: String },
    firstMessage: { type: String },
    systemPrompt: { type: String },
    functions: [{ type: Schema.Types.Mixed }]
  },
  phoneNumber: {
    id: { type: String },
    number: { type: String },
    status: { type: String },
    areaCode: { type: String }
  },
  statistics: {
    totalCalls: { type: Number, default: 0 },
    callsToday: { type: Number, default: 0 },
    avgDuration: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    lastActive: { type: Date }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes for performance
AssistantSchema.index({ userId: 1 });
AssistantSchema.index({ vapiAssistantId: 1 });
AssistantSchema.index({ status: 1 });

// Helper methods
AssistantSchema.methods.updateStatistics = function(callData: any) {
  this.statistics.totalCalls += 1;
  this.statistics.lastActive = new Date();
  // Additional statistics logic can be added here
};

// Static methods
AssistantSchema.statics.getActiveAssistantsForUser = function(userId: string) {
  return this.find({ userId, status: 'active' });
};

AssistantSchema.statics.getAssistantStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAssistants: { $sum: 1 },
        activeAssistants: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        totalCalls: { $sum: '$statistics.totalCalls' },
        avgSuccessRate: { $avg: '$statistics.successRate' }
      }
    }
  ]);
};

const AssistantModel = models.Assistant || model<IAssistant>('Assistant', AssistantSchema);

export default AssistantModel;
