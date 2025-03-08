'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InvoicePdfGenerator from '@/components/invoices/InvoicePdfGenerator';
import InvoiceEmailSender from '@/components/invoices/InvoiceEmailSender';

export default function InvoiceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/invoices');
    }
  }, [status, router]);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (status === 'authenticated' && params.id) {
        try {
          setLoading(true);
          const response = await fetch(`/api/invoices/${params.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch invoice details');
          }
          
          const data = await response.json();
          setInvoice(data.invoice);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInvoiceDetails();
  }, [status, params.id]);

  // Update invoice status
  const updateInvoiceStatus = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }
      
      const data = await response.json();
      setInvoice(data.invoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  // Show error message
  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          Error: {error}
        </div>
        <Link
          href="/invoices"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  // Show not found message
  if (!invoice) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Invoice not found.</p>
        </div>
        <Link
          href="/invoices"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              invoice.status === 'paid'
                ? 'bg-green-100 text-green-800'
                : invoice.status === 'overdue'
                ? 'bg-red-100 text-red-800'
                : invoice.status === 'sent'
                ? 'bg-blue-100 text-blue-800'
                : invoice.status === 'draft'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
          {invoice.aiGenerated && (
            <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800">
              AI Generated
            </span>
          )}
        </div>
      </div>

      {/* Invoice Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">From</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">{session.user.name}</p>
            <p>{session.user.email}</p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">To</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">{invoice.client.name}</p>
            <p>{invoice.client.email}</p>
            {invoice.client.address && (
              <div className="mt-2 text-gray-600">
                {invoice.client.address.street && <p>{invoice.client.address.street}</p>}
                <p>
                  {invoice.client.address.city && `${invoice.client.address.city}, `}
                  {invoice.client.address.state && `${invoice.client.address.state} `}
                  {invoice.client.address.zipCode && invoice.client.address.zipCode}
                </p>
                {invoice.client.address.country && <p>{invoice.client.address.country}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Invoice Date</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>{formatDate(invoice.dateIssued)}</p>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Due Date</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>{formatDate(invoice.dateDue)}</p>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <h2 className="text-lg font-semibold mb-4">Items</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b">Description</th>
              <th className="py-3 px-4 text-right border-b">Quantity</th>
              <th className="py-3 px-4 text-right border-b">Unit Price</th>
              <th className="py-3 px-4 text-right border-b">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4 text-right">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan="3" className="py-3 px-4 text-right font-medium">
                Subtotal
              </td>
              <td className="py-3 px-4 text-right font-medium">
                {formatCurrency(invoice.subtotal)}
              </td>
            </tr>
            {invoice.taxRate > 0 && (
              <tr className="bg-gray-50">
                <td colSpan="3" className="py-3 px-4 text-right font-medium">
                  Tax ({invoice.taxRate}%)
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  {formatCurrency(invoice.taxAmount)}
                </td>
              </tr>
            )}
            <tr className="bg-blue-50">
              <td colSpan="3" className="py-3 px-4 text-right font-bold">
                Total
              </td>
              <td className="py-3 px-4 text-right font-bold">
                {formatCurrency(invoice.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t pt-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {invoice.status === 'draft' && (
            <button
              onClick={() => updateInvoiceStatus('sent')}
              disabled={statusUpdateLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Mark as Sent
            </button>
          )}
          {(invoice.status === 'draft' || invoice.status === 'sent') && (
            <button
              onClick={() => updateInvoiceStatus('paid')}
              disabled={statusUpdateLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Mark as Paid
            </button>
          )}
          {invoice.status === 'sent' && (
            <button
              onClick={() => updateInvoiceStatus('overdue')}
              disabled={statusUpdateLoading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Mark as Overdue
            </button>
          )}
          {invoice.status !== 'cancelled' && (
            <button
              onClick={() => updateInvoiceStatus('cancelled')}
              disabled={statusUpdateLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel Invoice
            </button>
          )}
          <button
            onClick={() => setShowPdfModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Send via Email
          </button>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/invoices"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Back to Invoices
        </Link>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 shadow-md">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* PDF Generator Modal */}
      {showPdfModal && invoice && session && (
        <InvoicePdfGenerator 
          invoice={invoice} 
          session={session} 
          onClose={() => setShowPdfModal(false)} 
        />
      )}
      
      {/* Email Sender Modal */}
      {showEmailModal && invoice && (
        <InvoiceEmailSender 
          invoice={invoice} 
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => {
            setSuccessMessage('Invoice sent successfully!');
            // Update invoice status if it was in draft
            if (invoice.status === 'draft') {
              setInvoice({...invoice, status: 'sent'});
            }
          }}
        />
      )}
    </div>
  );
}
