import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    // Connect to the database
    await dbConnect();
    
    // Parse the request body
    const body = await request.json();
    
    // Find the user by email (from session)
    const user = await User.findOne({ email: session.user.email }).select('+password');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // Update user name if provided
    if (body.name) {
      user.name = body.name;
    }
    
    // Handle password change if requested
    if (body.newPassword) {
      // Verify current password
      if (!body.currentPassword) {
        return NextResponse.json({
          success: false,
          error: 'Current password is required to set a new password'
        }, { status: 400 });
      }
      
      // Check if current password is correct
      const isPasswordValid = await user.comparePassword(body.currentPassword);
      
      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          error: 'Current password is incorrect'
        }, { status: 400 });
      }
      
      // Set new password
      user.password = body.newPassword;
    }
    
    // Save the updated user
    await user.save();
    
    // Return success response (without password)
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update profile'
    }, { status: 500 });
  }
}
