'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AuthNavbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md py-3 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
              <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875 4.03-4.875 9-4.875 9 2.183 9 4.875z" />
              <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 001.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 001.897 1.384C6.809 12.164 9.315 12.75 12 12.75z" />
              <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 15.914 9.315 16.5 12 16.5z" />
              <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 19.664 9.315 20.25 12 20.25z" />
            </svg>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              InvoiceAI
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors">
                  Dashboard
                </Link>
                
                <Link href="/invoices" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors">
                  Invoices
                </Link>
                
                <div className="flex items-center pl-6 border-l border-gray-200 dark:border-gray-700">
                  <div className="relative group">
                    <div className="flex items-center space-x-2 cursor-pointer">
                      {session?.user?.image ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary-light">
                          <Image 
                            src={session.user.image} 
                            alt="Profile picture"
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {session?.user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      
                      <span className="text-gray-700 dark:text-gray-200">
                        {session?.user?.name?.split(' ')[0] || 'User'}
                      </span>
                      
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Your Profile
                      </Link>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Dashboard
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  Login
                </Link>
                
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="pt-3 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    href="/invoices" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Invoices
                  </Link>
                  
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center px-3">
                      {session?.user?.image ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-light">
                          <Image 
                            src={session.user.image} 
                            alt="Profile picture"
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {session?.user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800 dark:text-gray-200">{session?.user?.name || 'User'}</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{session?.user?.email || ''}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 px-2">
                      <button 
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-2 px-2">
                  <Link 
                    href="/auth/login" 
                    className="w-full flex items-center justify-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  
                  <Link 
                    href="/auth/register" 
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
