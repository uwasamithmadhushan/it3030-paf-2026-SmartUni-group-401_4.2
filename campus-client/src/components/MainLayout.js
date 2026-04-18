import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header (Visible only on mobile for sidebar trigger) */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Desktop Header (Minimal or Page Title can go here later) */}
        <header className="hidden lg:flex px-10 h-20 items-center justify-between bg-white border-b border-slate-100 shrink-0">
           <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest opacity-40">Operational Workspace</h2>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
