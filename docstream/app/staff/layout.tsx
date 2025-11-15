// app/staff/layout.tsx
'use client'

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import StaffSidebar from "@/components/StaffSidebar";
import Navbar from "@/components/Navbar";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <StaffSidebar />
        
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 p-2 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar with mobile menu button */}
        <div className="flex items-center">
          <button
            className="p-2 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <Navbar />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}