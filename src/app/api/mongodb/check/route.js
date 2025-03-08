import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Try to get the count of users to verify the connection
    const count = await User.countDocuments();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
      userCount: count
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to connect to MongoDB'
    }, { status: 500 });
  }
}
