'use client';

import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

export default function InvoicePdfGenerator({ invoice, session, onClose }) {
  const componentRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

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

  // Set component as ready after mount
  useEffect(() => {
    // Short delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000); // Longer delay to ensure DOM is fully rendered
    
    return () => clearTimeout(timer);
  }, []);
  
  // Setup react-to-print
  const handlePrint = () => {
    if (!componentRef.current) {
      console.error('Print reference not available');
      return;
    }
    
    // Use a direct implementation
    const printContent = () => {
      try {
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'absolute';
        printIframe.style.top = '-9999px';
        printIframe.style.left = '-9999px';
        document.body.appendChild(printIframe);
        
        const contentDocument = printIframe.contentDocument;
        const printableContent = componentRef.current.innerHTML;
        
        contentDocument.open();
        contentDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice-${invoice.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; }
                th { border-bottom: 1px solid #ddd; }
                .text-right { text-align: right; }
                @media print {
                  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${printableContent}
            </body>
          </html>
        `);
        contentDocument.close();
        
        printIframe.onload = () => {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
          
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(printIframe);
            onClose();
          }, 100);
        };
      } catch (error) {
        console.error('Print error:', error);
      }
    };
    
    // Delay to ensure content is ready
    setTimeout(printContent, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Download Invoice</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              disabled={!isReady}
              className={`px-4 py-2 ${!isReady ? 'bg-blue-300 cursor-wait' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded transition-colors`}
            >
              {!isReady ? 'Preparing PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Invoice */}
        <div ref={componentRef} className="p-8 bg-white" id="printable-invoice">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">{session.user.name}</p>
              <p>{session.user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Bill To:</h2>
              <div className="text-gray-600">
                <p className="font-medium">{invoice.client.name}</p>
                <p>{invoice.client.email}</p>
                {invoice.client.address && (
                  <>
                    {invoice.client.address.street && <p>{invoice.client.address.street}</p>}
                    <p>
                      {invoice.client.address.city && `${invoice.client.address.city}, `}
                      {invoice.client.address.state && `${invoice.client.address.state} `}
                      {invoice.client.address.zipCode && invoice.client.address.zipCode}
                    </p>
                    {invoice.client.address.country && <p>{invoice.client.address.country}</p>}
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Invoice Date: </span>
                <span className="text-gray-600">{formatDate(invoice.dateIssued)}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Due Date: </span>
                <span className="text-gray-600">{formatDate(invoice.dateDue)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status: </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
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
              </div>
            </div>
          </div>

          <table className="min-w-full border-collapse mb-8">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-3 text-left text-gray-700">Description</th>
                <th className="py-3 text-right text-gray-700">Quantity</th>
                <th className="py-3 text-right text-gray-700">Unit Price</th>
                <th className="py-3 text-right text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 text-gray-600">{item.description}</td>
                  <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right text-gray-600">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="py-3 text-right font-medium text-gray-700">
                  Subtotal
                </td>
                <td className="py-3 text-right font-medium text-gray-700">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              {invoice.taxRate > 0 && (
                <tr>
                  <td colSpan="3" className="py-3 text-right font-medium text-gray-700">
                    Tax ({invoice.taxRate}%)
                  </td>
                  <td className="py-3 text-right font-medium text-gray-700">
                    {formatCurrency(invoice.taxAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan="3" className="py-3 text-right font-bold text-gray-800">
                  Total
                </td>
                <td className="py-3 text-right font-bold text-gray-800">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>
            </tfoot>
          </table>

          {invoice.notes && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Notes:</h2>
              <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          <div className="text-center text-gray-500 text-sm mt-12">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
