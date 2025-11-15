// app/supervisor/layout.tsx
'use client'

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import VehicleOfficerSidebar from "@/components/VehicleOfficerSidebar";
import Navbar from "@/components/Navbar";

interface VehicleLayoutProps {
  children: React.ReactNode;
}

export default function SupervisorLayout({ children }: VehicleLayoutProps) {
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
        <VehicleOfficerSidebar />
        
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 p-2 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Navbar with mobile menu button */}
        <div className="flex items-center border-b border-gray-200 bg-white">
          <button
            className="p-4 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <Navbar />
          </div>
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}