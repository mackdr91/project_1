'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [dbStatus, setDbStatus] = useState('checking');
  const [dbMessage, setDbMessage] = useState('');
  const [users, setUsers] = useState([]);
  
  // Check MongoDB connection on component mount
  useEffect(() => {
    const checkMongoConnection = async () => {
      try {
        setDbStatus('checking');
        setDbMessage('Checking MongoDB connection...');
        
        // Call the MongoDB check API endpoint
        const response = await fetch('/api/mongodb/check');
        const data = await response.json();
        
        if (data.success) {
          setDbStatus('connected');
          setDbMessage(`Successfully connected to MongoDB! Found ${data.userCount} users.`);
          
          // If connected, fetch users
          const usersResponse = await fetch('/api/users');
          const usersData = await usersResponse.json();
          
          if (usersData.success) {
            setUsers(usersData.data);
          }
        } else {
          setDbStatus('error');
          setDbMessage(`Failed to connect to MongoDB: ${data.error}`);
        }
      } catch (error) {
        setDbStatus('error');
        setDbMessage(`Error checking MongoDB connection: ${error.message}`);
        console.error('MongoDB connection error:', error);
      }
    };
    
    checkMongoConnection();
  }, []);
  
  // Function to add a test user
  const addTestUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Test User ${Math.floor(Math.random() * 1000)}`,
          email: `test${Math.floor(Math.random() * 10000)}@example.com`,
          password: 'password123', // Default password for test users
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh the user list
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();
        
        if (usersData.success) {
          setUsers(usersData.data);
        }
      } else {
        alert(`Failed to add user: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding test user:', error);
      alert(`Error adding test user: ${error.message}`);
    }
  };
  
  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Next.js MongoDB App</h1>
          <p className="text-gray-600">A full-stack application with authentication</p>
        </div>
        
        {isAuthenticated ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Welcome back, {session.user.name}!</h2>
            <p className="text-green-700">You are currently signed in with {session.user.email}</p>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome, Guest!</h2>
            <p className="text-blue-700 mb-4">Please sign in to access all features of the application.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login" 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* MongoDB Connection Status */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Database Connection Status</h2>
        
        <div className="mb-4 p-4 rounded-md border">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              dbStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
              dbStatus === 'connected' ? 'bg-green-500' :
              'bg-red-500'
            }`}></div>
            
            <p className={`font-medium ${
              dbStatus === 'connected' ? 'text-green-600' : 
              dbStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {dbStatus === 'connected' ? 'Connected' : 
               dbStatus === 'error' ? 'Connection Error' : 'Checking Connection'}
            </p>
          </div>
          
          <p className="mt-2 text-gray-700">{dbMessage}</p>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Connection Details</h3>
          <div className="bg-gray-50 p-3 rounded font-mono text-sm">
            <p>MongoDB URI: {process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-app'}</p>
            <p className="mt-1">Environment: {process.env.NODE_ENV || 'development'}</p>
          </div>
        </div>
      </div>
      
      {/* Users Table - Only shown to authenticated users */}
      {dbStatus === 'connected' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Users in Database</h2>
            {isAuthenticated && (
              <button 
                onClick={addTestUser}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add Test User
              </button>
            )}
          </div>
          
          {!isAuthenticated ? (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="text-yellow-700">Please sign in to view and manage users.</p>
            </div>
          ) : users.length === 0 ? (
            <p>No users found in the database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
