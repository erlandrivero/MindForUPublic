import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import Call from '@/models/Call';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    await connectMongo();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate date range
    const days = parseInt(range.replace('d', '')) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Parallel queries for analytics data
    const [callVolume, performanceMetrics, callTypes, hourlyDistribution] = await Promise.all([
      // Call volume trends
      Call.getCallVolumeForUser(user._id, days),
      
      // Performance metrics by assistant
      Call.aggregate([
        { $match: { userId: user._id } },
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
            _id: '$assistant.name',
            calls: { $sum: 1 },
            successfulCalls: { $sum: { $cond: [{ $eq: ['$outcome', 'successful'] }, 1, 0] } },
            avgDuration: { $avg: '$duration' },
            totalDuration: { $sum: '$duration' },
            avgSatisfaction: { $avg: '$metadata.satisfactionScore' }
          }
        },
        {
          $project: {
            assistant: '$_id',
            calls: 1,
            successRate: { 
              $multiply: [
                { $divide: ['$successfulCalls', '$calls'] }, 
                100
              ] 
            },
            avgDuration: { $divide: ['$avgDuration', 60] }, // Convert to minutes
            satisfaction: { $ifNull: ['$avgSatisfaction', 4.0] }
          }
        },
        { $sort: { calls: -1 } }
      ]),
      
      // Call types distribution
      Call.getCallTypeDistribution(user._id),
      
      // Hourly distribution
      Call.getHourlyDistribution(user._id, days)
    ]);

    // Format call volume data
    const formattedCallVolume = callVolume.map(item => ({
      date: item._id,
      calls: item.calls,
      successful: item.successful,
      failed: item.failed
    }));

    // Format performance metrics
    const formattedPerformanceMetrics = performanceMetrics.map(item => ({
      assistant: item.assistant,
      calls: item.calls,
      successRate: Math.round(item.successRate * 10) / 10,
      avgDuration: Math.round(item.avgDuration * 10) / 10,
      satisfaction: Math.round(item.satisfaction * 10) / 10
    }));

    // Format call types with colors
    const typeColors = {
      'customer_service': '#14B8A6',
      'sales': '#3B82F6',
      'scheduling': '#8B5CF6',
      'general': '#F59E0B'
    };

    const formattedCallTypes = callTypes.map(item => ({
      name: item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: item.count,
      color: typeColors[item._id as keyof typeof typeColors] || '#6B7280'
    }));

    // Format hourly distribution
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const formattedHourlyDistribution = hours.map(hour => {
      const data = hourlyDistribution.find(item => item._id === hour);
      return {
        hour: `${hour}:00`,
        calls: data?.calls || 0
      };
    }).filter(item => item.hour >= '9:00' && item.hour <= '17:00'); // Business hours only

    // Calculate summary metrics
    const totalCalls = callVolume.reduce((sum, item) => sum + item.calls, 0);
    const totalSuccessful = callVolume.reduce((sum, item) => sum + item.successful, 0);
    const totalFailed = callVolume.reduce((sum, item) => sum + item.failed, 0);
    const overallSuccessRate = totalCalls > 0 ? (totalSuccessful / totalCalls * 100) : 0;

    // Get average duration from all calls
    const avgDurationResult = await Call.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    const avgDuration = avgDurationResult[0]?.avgDuration || 0;

    // Get unique callers count
    const uniqueCallers = await Call.distinct('phoneNumber', { userId: user._id });

    const analyticsData = {
      callVolume: formattedCallVolume,
      performanceMetrics: formattedPerformanceMetrics,
      callTypes: formattedCallTypes,
      hourlyDistribution: formattedHourlyDistribution,
      summary: {
        totalCalls,
        successRate: Math.round(overallSuccessRate * 10) / 10,
        avgDuration: Math.round(avgDuration / 60 * 10) / 10, // Convert to minutes
        uniqueCallers: uniqueCallers.length
      }
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export function to get call volume data (used by other APIs)
export async function getCallVolumeData(userId: string, days: number = 7) {
  return Call.getCallVolumeForUser(userId, days);
}
