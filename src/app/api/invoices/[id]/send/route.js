import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb/mongoose';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import mongoose from 'mongoose';

// Email sending functionality
async function sendEmail(emailData) {
  // For development/testing, we'll log the email data
  console.log('Sending email:', emailData);
  
  // Check if we have an email service API key
  if (process.env.EMAIL_SERVICE_API_KEY) {
    try {
      // Example with SendGrid - uncomment and configure when ready for production
      /*
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: emailData.to }] }],
          from: { email: process.env.EMAIL_FROM || 'your-company@example.com' },
          subject: emailData.subject,
          content: [{ type: 'text/plain', value: emailData.message }],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }
      
      return { success: true };
      */
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  
  // For demo purposes, we'll just return success
  return { success: true };
}

export async function POST(request, { params }) {
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
    const emailData = await request.json();
    
    // Validate email data
    if (!emailData.to || !emailData.subject || !emailData.message) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    // Send the email
    await sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      message: emailData.message,
      invoice: invoice
    });

    // Update the invoice status to 'sent' if it's in 'draft' status
    if (invoice.status === 'draft') {
      invoice.status = 'sent';
      await invoice.save();
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      invoice: invoice
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
