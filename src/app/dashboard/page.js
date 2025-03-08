'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InvoiceAnalytics from '@/components/dashboard/InvoiceAnalytics';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', 'quarter', 'year'

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          // Here you could fetch additional user data from your API if needed
          setUserData(session.user);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [status, session]);
  
  // Fetch invoices data
  const fetchInvoices = useCallback(async () => {
    if (status === 'authenticated') {
      try {
        setInvoicesLoading(true);
        const response = await fetch('/api/invoices');
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        
        const data = await response.json();
        setInvoices(data.invoices || []);
        
        // Scroll to analytics if URL has #analytics hash
        if (window.location.hash === '#analytics') {
          setTimeout(() => {
            document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setInvoicesLoading(false);
      }
    }
  }, [status]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  
  // Filter invoices based on timeframe
  const filteredInvoices = useCallback(() => {
    if (timeframe === 'all') return invoices;
    
    const now = new Date();
    let startDate;
    
    switch(timeframe) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return invoices;
    }
    
    return invoices.filter(invoice => new Date(invoice.dateIssued) >= startDate);
  }, [invoices, timeframe]);

  // Show loading state
  if (status === 'loading' || loading || invoicesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome to your dashboard!</h2>
        <p className="text-blue-700">This is a protected page that only authenticated users can access.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="text-blue-500 text-3xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Invoice Generator</h3>
          <p className="text-gray-600 mb-4">Create professional invoices automatically using AI. Just describe your work and client.</p>
          <Link href="/invoices" className="text-blue-500 hover:text-blue-700 font-medium inline-flex items-center">
            Manage Invoices
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="text-green-500 text-3xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Invoice Analytics</h3>
          <p className="text-gray-600 mb-4">View detailed analytics and insights about your invoicing activity.</p>
          <a href="#analytics" className="text-green-500 hover:text-green-700 font-medium inline-flex items-center">
            View Analytics
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="text-purple-500 text-3xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Email Invoices</h3>
          <p className="text-gray-600 mb-4">Send professional invoices directly to your clients via email.</p>
          <Link href="/invoices" className="text-purple-500 hover:text-purple-700 font-medium inline-flex items-center">
            Send Invoices
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
      
      {userData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            {userData.image && (
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image 
                    src={userData.image} 
                    alt={`${userData.name}'s profile picture`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{userData.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium">{userData.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Role:</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userData.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userData.role || 'user'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Verified:</p>
                <p className="font-medium">
                  {userData.isVerified ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoice Analytics Section */}
      <div id="analytics" className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invoice Analytics</h2>
          
          {/* Timeframe Filter */}
          {invoices.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Timeframe:</span>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              
              <button 
                onClick={() => fetchInvoices()}
                className="text-blue-500 hover:text-blue-700"
                title="Refresh Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {invoices.length > 0 ? (
          <InvoiceAnalytics invoices={filteredInvoices()} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 mb-4">No invoice data available yet.</p>
            <Link 
              href="/invoices"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-block"
            >
              Create Your First Invoice
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-center"
        >
          Back to Home
        </Link>
        <Link 
          href="/invoices"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center"
        >
          Manage Invoices
        </Link>
        <Link 
          href="/auth/logout"
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-center"
        >
          Sign Out
        </Link>
      </div>
    </div>
  );
}
