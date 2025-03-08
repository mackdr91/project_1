'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function InvoiceAnalytics({ invoices }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    averageInvoiceValue: 0,
    statusCounts: {},
    monthlyData: [],
  });

  const calculateStats = useCallback((invoices) => {
    // Calculate basic stats
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const averageInvoiceValue = totalAmount / totalInvoices;

    // Calculate status counts
    const statusCounts = invoices.reduce((counts, invoice) => {
      counts[invoice.status] = (counts[invoice.status] || 0) + 1;
      return counts;
    }, {});

    // Calculate monthly data (last 6 months)
    const monthlyData = getMonthlyData(invoices);

    setStats({
      totalInvoices,
      totalAmount,
      paidAmount,
      overdueAmount,
      averageInvoiceValue,
      statusCounts,
      monthlyData,
    });
  }, []);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      calculateStats(invoices);
      setLoading(false);
    }
  }, [invoices, calculateStats]);



  const getMonthlyData = (invoices) => {
    const now = new Date();
    const months = [];
    const monthlyTotals = [];
    const monthlyPaid = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push(monthName);

      // Filter invoices for this month
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate.getMonth() === month.getMonth() && 
               invoiceDate.getFullYear() === month.getFullYear();
      });

      // Calculate totals
      const total = monthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
      monthlyTotals.push(total);

      // Calculate paid amount
      const paid = monthInvoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.total, 0);
      monthlyPaid.push(paid);
    }

    return { months, monthlyTotals, monthlyPaid };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Bar chart data
  const barData = {
    labels: stats.monthlyData.months,
    datasets: [
      {
        label: 'Total',
        data: stats.monthlyData.monthlyTotals,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Paid',
        data: stats.monthlyData.monthlyPaid,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Invoice Totals',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Doughnut chart data
  const doughnutData = {
    labels: Object.keys(stats.statusCounts).map(
      status => status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [
      {
        data: Object.values(stats.statusCounts),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // paid - green
          'rgba(54, 162, 235, 0.6)', // sent - blue
          'rgba(255, 206, 86, 0.6)', // draft - yellow
          'rgba(255, 99, 132, 0.6)', // overdue - red
          'rgba(153, 102, 255, 0.6)', // cancelled - purple
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Doughnut chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Invoice Status Distribution',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Analytics</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No invoice data available.</p>
          <p className="text-gray-500 mt-2">
            Create some invoices to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Invoice Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Total Invoices</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.totalInvoices}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-800 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.paidAmount)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-red-800 mb-1">Total Overdue</h3>
          <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.overdueAmount)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-800 mb-1">Average Invoice</h3>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.averageInvoiceValue)}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}
