import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb/mongoose';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { generateInvoiceFromDescription } from '@/utils/aiInvoiceGenerator';

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
    const { clientDescription } = data;

    if (!clientDescription) {
      return NextResponse.json({ error: 'Client description is required' }, { status: 400 });
    }

    // Generate invoice data based on the description using our AI utility
    const invoiceData = await generateInvoiceFromDescription(clientDescription);

    // Generate a unique invoice number
    const count = await Invoice.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    
    // Create a new invoice
    const invoice = new Invoice({
      user: user._id,
      invoiceNumber: invoiceNumber, // Explicitly set the invoice number
      dateIssued: new Date(invoiceData.dateIssued),
      dateDue: new Date(invoiceData.dateDue),
      client: invoiceData.client,
      items: invoiceData.items,
      subtotal: invoiceData.subtotal,
      taxRate: invoiceData.taxRate,
      taxAmount: invoiceData.taxAmount,
      total: invoiceData.total,
      notes: invoiceData.notes,
      status: invoiceData.status,
      aiGenerated: invoiceData.aiGenerated
    });

    await invoice.save();

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

// The generateInvoiceFromDescription function is now imported from @/utils/aiInvoiceGenerator
