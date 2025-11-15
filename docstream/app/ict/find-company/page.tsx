"use client";

import { Search } from "lucide-react";

export default function FindCompany() {
  return (
    <div className="flex justify-center items-center h-[70vh] px-4">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md text-center">
        
        <input
          type="text"
          placeholder="Station Name"
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md mb-5 text-[15px] outline-none focus:border-green-700 focus:bg-white"
        />

        <button className="w-full bg-green-700 text-white p-3 rounded-md text-[15px] font-medium cursor-pointer flex items-center justify-center gap-2 transition hover:bg-green-800">
          Search <Search size={18} />
        </button>

      </div>
    </div>
  );
}
