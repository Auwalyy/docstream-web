"use client";

import { useRouter } from "next/navigation";

export default function RequestVehicle() {
  const router = useRouter();

  const requests = [
    { status: "Approved", name: "Mansur Isa" },
    { status: "Approved", name: "Isa Tafida" },
    { status: "Pending", name: "Musa Hassan" },
    { status: "Declined", name: "Ali Hashim" },
  ];

  return (
    <div className="flex justify-between items-start p-10 bg-gray-100 min-h-[calc(100vh-70px)]">
      
      {/* Buttons Section */}
      <div className="flex flex-col gap-6 items-center flex-1 mr-10">
        <button
          className="w-[280px] h-[55px] bg-amber-500 text-white font-semibold text-lg rounded-lg hover:bg-amber-600 transition"
          onClick={() => router.push("/ict/request-vehicle/within")}
        >
          Within
        </button>

        <button
          className="w-[280px] h-[55px] bg-green-700 text-white font-semibold text-lg rounded-lg hover:bg-green-800 transition"
          onClick={() => router.push("/request-vehicle/out-of-town")}
        >
          Out of Town
        </button>
      </div>

      {/* Vehicle List Section */}
      <div className="w-[350px] bg-gray-50 rounded-xl p-7 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Vehicles Requisition - Today
        </h3>

        <ul className="space-y-2">
          {requests.map((req, index) => (
            <li
              key={index}
              className="flex justify-between text-sm text-gray-800 border-b border-gray-200 pb-2 last:border-b-0"
            >
              <span>
                • {req.status} Request: {req.name}
              </span>

              <a
                href="#"
                className="text-green-700 font-medium italic hover:underline"
              >
                More Details
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
