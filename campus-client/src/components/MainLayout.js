import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden lg:ml-72">
        {/* Top Header (Visible only on mobile for sidebar trigger) */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Desktop Header */}
        <header className="hidden lg:flex px-8 h-20 items-center justify-between bg-white border-b border-slate-100 shrink-0">
          {/* Global Search Bar */}
          <div className="relative w-96">
            <svg className="w-4 h-4 text-gray-400 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search for resources, tickets..." 
              className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-shadow outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Right Side: Notifications & Profile */}
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E] flex items-center justify-center font-bold text-white text-sm shadow-sm group-hover:shadow-md transition-shadow">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{user?.username || 'User'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.role || 'USER'}</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 ml-1 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
