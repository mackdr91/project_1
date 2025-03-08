import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

// Helper function to check authentication
async function checkAuth() {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Fetch all users (excluding password field which is already excluded by default)
    const users = await User.find({}).sort({ createdAt: -1 });
    
    // Return success response with users
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch users'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required'
      }, { status: 400 });
    }
    
    // For security, check if this is an authenticated request when setting role to admin
    if (body.role === 'admin') {
      const session = await checkAuth();
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized to create admin users'
        }, { status: 403 });
      }
    }
    
    // Create a new user with password if provided
    const userData = {
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      isVerified: body.isVerified || false
    };
    
    // Add password if provided
    if (body.password) {
      userData.password = body.password;
    } else {
      // For testing purposes, we'll allow creating users without passwords
      // In a real application, you would always require a password
      userData.password = 'defaultpassword123';
    }
    
    // Create the user
    const user = await User.create(userData);
    
    // Return success response with the created user (password will be excluded)
    return NextResponse.json({
      success: true,
      data: user
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check for duplicate key error (e.g., email already exists)
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists'
      }, { status: 409 });
    }
    
    // Return general error response
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create user'
    }, { status: 500 });
  }
}
