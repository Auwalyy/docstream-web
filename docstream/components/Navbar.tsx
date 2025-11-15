'use client'

import React, { useState, useEffect } from "react";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface Notification {
  id: number;
  name: string;
}

const Navbar = () => {
  const [userRole, setUserRole] = useState("staff"); // Default to staff
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const notifications: Notification[] = [
    { id: 1, name: "Abdullahi Isa" },
    { id: 2, name: "Khamis Adam" },
    { id: 3, name: "Muhammad Yusuf" },
  ];

  // Detect role based on current route
  useEffect(() => {
    const detectRoleFromRoute = () => {
      if (pathname.includes('/supervisor') || pathname.includes('/add-facility')) {
        return 'supervisor';
      } else if (pathname.includes('/ict') || pathname.includes('/staff-management') || pathname.includes('/activity-log')) {
        return 'ict-staff';
      } else if (pathname.includes('/admin')) {
        return 'admin';
      } else {
        return 'staff'; // Default role for all other routes
      }
    };

    setUserRole(detectRoleFromRoute());
  }, [pathname]);

  const isSupervisor = userRole === "supervisor";
  const isICTStaff = userRole === "ict-staff";
  const isAdmin = userRole === "admin";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setNotificationOpen(false);
      setUserMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: number) => {
    setNotificationOpen(false);
    router.push(`/request/${id}`);
  };

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
    setNotificationOpen(false);
  };

  const handleNotificationIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationOpen(!notificationOpen);
    setUserMenuOpen(false);
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch(userRole) {
      case 'supervisor': return 'Supervisor';
      case 'ict-staff': return 'ICT Staff';
      case 'admin': return 'Administrator';
      default: return 'Staff';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-8 py-3 sm:py-4 sticky top-0 z-40">
      {/* Page Title with Role Badge */}
      <div className="flex items-center gap-3 mb-3 sm:mb-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Dashboard
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full capitalize">
          {userRole}
        </span>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto justify-between sm:justify-normal">
        {/* Active Status */}
        <div className="bg-emerald-50 text-emerald-700 font-medium rounded-full py-1.5 px-3 sm:px-4 flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-600 rounded-full"></span>
          Active
        </div>

        {/* Notifications only for Supervisor */}
        {isSupervisor && (
          <div className="relative">
            <div 
              className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={handleNotificationIconClick}
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                {notifications.length}
              </span>
            </div>

            {notificationOpen && (
              <div 
                className="absolute top-12 right-0 w-80 sm:w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-3 px-4 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {notifications.length} new
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center bg-emerald-50 p-3 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-100"
                      onClick={() => handleNotificationClick(note.id)}
                    >
                      <div className="w-7 h-7 bg-emerald-200 flex items-center justify-center mr-3 rounded-lg text-sm">
                        📩
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 text-sm font-medium">
                          Incoming Request
                        </p>
                        <p className="text-gray-500 text-xs">
                          From {note.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Menu */}
        <div className="relative">
          <div 
            className="bg-emerald-50 p-2 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-colors"
            onClick={handleUserMenuClick}
          >
            <User size={18} className="text-gray-600" />
          </div>

          {userMenuOpen && (
            <div 
              className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">User Profile</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={16} />
                Settings
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;