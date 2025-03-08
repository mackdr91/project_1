import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb/mongoose';
import Invoice from '@/models/Invoice';
import User from '@/models/User';

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

    // Get all invoices for the user
    const invoices = await Invoice.find({ user: user._id }).sort({ dateIssued: -1 });

    // Calculate analytics data
    const analytics = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, invoice) => sum + invoice.total, 0),
      paidInvoices: invoices.filter(invoice => invoice.status === 'paid').length,
      paidAmount: invoices.filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.total, 0),
      overdueInvoices: invoices.filter(invoice => invoice.status === 'overdue').length,
      overdueAmount: invoices.filter(invoice => invoice.status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.total, 0),
      draftInvoices: invoices.filter(invoice => invoice.status === 'draft').length,
      sentInvoices: invoices.filter(invoice => invoice.status === 'sent').length,
      cancelledInvoices: invoices.filter(invoice => invoice.status === 'cancelled').length,
      aiGeneratedInvoices: invoices.filter(invoice => invoice.aiGenerated).length,
      recentInvoices: invoices.slice(0, 5), // Get 5 most recent invoices
    };

    // Calculate monthly data (last 6 months)
    const monthlyData = getMonthlyData(invoices);
    analytics.monthlyData = monthlyData;

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice analytics' }, { status: 500 });
  }
}

function getMonthlyData(invoices) {
  const now = new Date();
  const result = [];

  // Get data for last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    // Filter invoices for this month
    const monthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.dateIssued);
      return invoiceDate >= month && invoiceDate <= monthEnd;
    });

    // Calculate totals
    const total = monthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paid = monthInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);

    result.push({
      month: month.toLocaleString('default', { month: 'short' }),
      year: month.getFullYear(),
      total,
      paid,
      count: monthInvoices.length,
    });
  }

  return result;
}
