'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">AI Flow</h1>
          <p className="text-gray-600 text-lg">Streamline Your Workflow with AI</p>
        </div>
        
        {isAuthenticated ? (
          <div className="text-center space-y-4">
            <p className="text-xl text-gray-700">Welcome back, {session.user.name}</p>
            <p className="text-gray-500">{session.user.email}</p>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-gray-600">Transform your workflow with AI-powered automation</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✨ Smart task automation</li>
                <li>🚀 Workflow optimization</li>
                <li>🤖 AI-driven insights</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link 
                href="/auth/register" 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </Link>
              <Link 
                href="/auth/login" 
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
