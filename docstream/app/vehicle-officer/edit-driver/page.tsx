// components/EditDriverVehicleInfo.tsx
'use client'

import React from "react";

interface Driver {
  name: string;
  time: string;
}

const EditDriverVehicleInfo = () => {
  const drivers: Driver[] = [
    { name: "Abdullahi Isa", time: "10:00AM" },
    { name: "Hassan", time: "12:00PM" },
  ];

  const handleEdit = (name: string) => {
    alert(`Editing details for ${name}`);
  };

  const handleExport = () => {
    alert("Exporting as Excel sheet...");
  };

  const handleShare = () => {
    alert("Sharing dashboard...");
  };

  return (
    <div className="p-10 px-15 bg-gray-50 min-h-screen">
      <h3 className="text-2xl font-semibold text-gray-800 mb-8">Vehicle Officer Dashboard</h3>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">
        {/* Header Row */}
        <div className="grid grid-cols-3 gap-6 pb-4 mb-4 border-b-2 border-gray-100 bg-gray-50 -mx-8 -mt-8 px-8 pt-8 rounded-t-2xl">
          <span className="font-semibold text-emerald-800 text-lg">Name</span>
          <span className="font-semibold text-emerald-800 text-lg">Time Submitted</span>
          <span className="font-semibold text-emerald-800 text-lg">Action</span>
        </div>

        {/* Data Rows */}
        {drivers.map((driver, index) => (
          <div 
            key={index} 
            className="grid grid-cols-3 gap-6 items-center py-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-800 font-medium text-base">{driver.name}</span>
            <span className="text-gray-600 text-base">{driver.time}</span>
            <button
              className="bg-emerald-700 text-white border-none py-2.5 px-6 rounded-lg cursor-pointer font-medium hover:bg-emerald-800 transition-colors w-fit"
              onClick={() => handleEdit(driver.name)}
            >
              Edit Details
            </button>
          </div>
        ))}
      </div>

      {/* Buttons Below Table */}
      <div className="flex flex-col items-center gap-5 mt-8">
        <button 
          className="bg-amber-400 text-gray-800 border-none py-3 px-12 rounded-xl font-semibold cursor-pointer hover:bg-amber-500 transition-colors shadow-lg hover:shadow-xl"
          onClick={handleExport}
        >
          Export as Excel Sheet
        </button>
        <button 
          className="border-2 border-emerald-700 bg-transparent text-emerald-700 py-3 px-12 rounded-xl font-semibold cursor-pointer hover:bg-emerald-50 transition-colors"
          onClick={handleShare}
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default EditDriverVehicleInfo;