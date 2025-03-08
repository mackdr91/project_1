import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb/mongoose';
import Invoice from '@/models/Invoice';
import User from '@/models/User';

// Get all invoices for the current user
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get the current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get invoices
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Invoice.countDocuments(query);

    return NextResponse.json({
      invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// Create a new invoice
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get the current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.client || !data.client.name || !data.client.email || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate amounts if not provided
    if (!data.subtotal || !data.total) {
      const subtotal = data.items.reduce((sum, item) => sum + (item.amount || (item.quantity * item.unitPrice)), 0);
      const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
      const total = subtotal + taxAmount;

      data.subtotal = subtotal;
      data.taxAmount = taxAmount;
      data.total = total;
    }

    // Create a new invoice
    const invoice = new Invoice({
      ...data,
      user: user._id,
      aiGenerated: false
    });

    await invoice.save();

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
