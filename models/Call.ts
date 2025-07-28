import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICall extends Document {
  userId: mongoose.Types.ObjectId;
  assistantId: mongoose.Types.ObjectId;
  vapiCallId: string;
  phoneNumber?: string; // Optional as it might not be available in Vapi data
  duration: number; // in seconds
  status: 'completed' | 'failed' | 'busy' | 'no-answer' | 'cancelled' | 'ended' | 'in-progress';  // Added 'ended' and 'in-progress' from Vapi
  startTime: Date;
  endTime?: Date;
  cost: number; // in cents
  transcript?: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  intent?: string;
  outcome: 'successful' | 'failed' | 'transferred' | 'voicemail' | 'ended' | 'in-progress';  // Added 'ended' and 'in-progress' from Vapi
  metadata: {
    callerLocation?: string;
    deviceType?: string;
    callQuality?: number;
    transferReason?: string;
    satisfactionScore?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<ICall>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assistantId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Assistant', 
    required: true 
  },
  vapiCallId: { 
    type: String, 
    required: true,
    unique: true 
  },
  phoneNumber: { 
    type: String, 
    required: false  // Made optional as it might not be available in Vapi data
  },
  duration: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: { 
    type: String, 
    enum: ['completed', 'failed', 'busy', 'no-answer', 'cancelled', 'ended', 'in-progress'],
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date 
  },
  cost: { 
    type: Number, 
    required: true,
    min: 0 
  },
  transcript: { 
    type: String 
  },
  summary: { 
    type: String 
  },
  sentiment: { 
    type: String, 
    enum: ['positive', 'neutral', 'negative'] 
  },
  intent: { 
    type: String 
  },
  outcome: { 
    type: String, 
    enum: ['successful', 'failed', 'transferred', 'voicemail', 'ended', 'in-progress'],
    required: true 
  },
  metadata: {
    callerLocation: { type: String },
    deviceType: { type: String },
    callQuality: { type: Number, min: 1, max: 5 },
    transferReason: { type: String },
    satisfactionScore: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes for performance
CallSchema.index({ userId: 1, createdAt: -1 });
CallSchema.index({ assistantId: 1, createdAt: -1 });
CallSchema.index({ vapiCallId: 1 });
CallSchema.index({ status: 1 });
CallSchema.index({ outcome: 1 });
CallSchema.index({ startTime: 1 });

// Virtual for call duration in minutes
CallSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.duration / 60 * 100) / 100;
});

// Static methods for analytics
CallSchema.statics.getCallVolumeForUser = function(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        calls: { $sum: 1 },
        successful: { $sum: { $cond: [{ $eq: ['$outcome', 'successful'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $ne: ['$outcome', 'successful'] }, 1, 0] } },
        totalDuration: { $sum: '$duration' },
        totalCost: { $sum: '$cost' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

CallSchema.statics.getCallStatsForUser = function(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalCalls: { $sum: 1 },
              successfulCalls: { $sum: { $cond: [{ $eq: ['$outcome', 'successful'] }, 1, 0] } },
              avgDuration: { $avg: '$duration' },
              totalCost: { $sum: '$cost' }
            }
          }
        ],
        today: [
          { $match: { createdAt: { $gte: today } } },
          {
            $group: {
              _id: null,
              callsToday: { $sum: 1 },
              successfulToday: { $sum: { $cond: [{ $eq: ['$outcome', 'successful'] }, 1, 0] } }
            }
          }
        ]
      }
    }
  ]);
};

CallSchema.statics.getHourlyDistribution = function(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: { $hour: '$startTime' },
        calls: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

CallSchema.statics.getCallTypeDistribution = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'assistants',
        localField: 'assistantId',
        foreignField: '_id',
        as: 'assistant'
      }
    },
    { $unwind: '$assistant' },
    {
      $group: {
        _id: '$assistant.type',
        count: { $sum: 1 }
      }
    }
  ]);
};

const CallModel = models.Call || model<ICall>('Call', CallSchema);

export default CallModel;
