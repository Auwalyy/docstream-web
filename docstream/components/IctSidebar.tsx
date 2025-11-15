'use client'

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";

const ICTStaffSidebar = () => {
  const pathname = usePathname();

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/find-company", label: "Find Company Details" },
    { href: "/request-vehicle", label: "Request Vehicle" },
    { href: "/inventory-form", label: "Inventory/Checklist Form" },
    { href: "/request-items", label: "Request Items" },
    { href: "/staff-management", label: "Staff Management" },
    { href: "/activity-log", label: "Activity Log" },
    { href: "/add-facility", label: "Add Facility" },
    { href: "/edit-driver-vehicle-info", label: "Edit Driver/Vehicle Info" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-300 flex flex-col items-center p-4">
      <div className="w-full flex justify-center items-center mb-8">
        <Image 
          src={logo} 
          alt="NMDPRA DocStream Logo" 
          className="w-full h-auto object-contain max-w-[200px]"
          priority
        />
      </div>

      <nav className="w-full flex flex-col gap-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-emerald-700 border border-emerald-700 py-2.5 px-4 rounded-lg text-center font-medium transition-all duration-200 hover:bg-emerald-700 hover:text-white ${
              isActiveLink(link.href) ? 'bg-emerald-700 text-white border-emerald-700' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default ICTStaffSidebar;