import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb/mongoose';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import mongoose from 'mongoose';

// Get a specific invoice
export async function GET(request, { params }) {
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

    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Get the invoice
    const invoice = await Invoice.findOne({
      _id: params.id,
      user: user._id
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// Update a specific invoice
export async function PATCH(request, { params }) {
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

    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Get the invoice
    const invoice = await Invoice.findOne({
      _id: params.id,
      user: user._id
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Parse request body
    const data = await request.json();
    
    // Update the invoice
    // Only allow updating specific fields
    const allowedUpdates = ['status', 'notes', 'dateDue', 'client', 'items', 'taxRate'];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (data[key] !== undefined) {
        updates[key] = data[key];
      }
    }
    
    // Recalculate totals if items or taxRate changed
    if (data.items) {
      // Calculate subtotal
      const subtotal = data.items.reduce((sum, item) => {
        const amount = item.quantity * item.unitPrice;
        // Update item amount
        item.amount = amount;
        return sum + amount;
      }, 0);
      
      updates.subtotal = subtotal;
      updates.items = data.items;
      
      // Calculate tax amount and total
      const taxRate = data.taxRate !== undefined ? data.taxRate : invoice.taxRate;
      const taxAmount = subtotal * (taxRate / 100);
      
      updates.taxAmount = taxAmount;
      updates.total = subtotal + taxAmount;
    } else if (data.taxRate !== undefined) {
      // Only tax rate changed, recalculate tax amount and total
      const taxAmount = invoice.subtotal * (data.taxRate / 100);
      updates.taxAmount = taxAmount;
      updates.total = invoice.subtotal + taxAmount;
    }
    
    // Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// Delete a specific invoice
export async function DELETE(request, { params }) {
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

    // Validate invoice ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Delete the invoice
    const result = await Invoice.deleteOne({
      _id: params.id,
      user: user._id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
