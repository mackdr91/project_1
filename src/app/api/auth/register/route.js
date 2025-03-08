import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/mongoose';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and password are required'
      }, { status: 400 });
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists'
      }, { status: 409 });
    }
    
    // Create a new user
    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
      // Optional fields
      role: body.role || 'user',
      isVerified: body.isVerified || false
    });
    
    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };
    
    // Return success response with the created user
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: userResponse
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    
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
      error: error.message || 'Failed to register user'
    }, { status: 500 });
  }
}
