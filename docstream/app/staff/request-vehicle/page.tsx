"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

interface VehicleRequest {
  id: string;
  status: "Approved" | "Pending" | "Declined";
  name: string;
  destination: string;
  purpose: string;
  date: string;
}

export default function RequestVehicle() {
  const router = useRouter();
  const { accessToken, user, isLoading } = useAuth();
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && (!accessToken || !user)) {
      router.push('/login');
    }
  }, [accessToken, user, isLoading, router]);

  // Fetch vehicle requests from API with token
  const fetchVehicleRequests = async () => {
    if (!accessToken) {
      setError("Please login first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/vehicle-request/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        throw new Error(`Failed to load requests: ${response.status}`);
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching vehicle requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vehicle requests');
    } finally {
      setLoading(false);
    }
  };

  // Load requests when component mounts or token changes
  useEffect(() => {
    if (accessToken) {
      fetchVehicleRequests();
    }
  }, [accessToken]);

  const handleWithinRequest = () => {
    if (!accessToken || !user) {
      alert("Please login first");
      router.push("/");
      return;
    }
    router.push("/staff/within");
  };

  const handleOutOfTownRequest = () => {
    if (!accessToken || !user) {
      alert("Please login first");
      router.push("/login");
      return;
    }
    router.push("/request-vehicle/out-of-town");
  };

  const handleMoreDetails = async (requestId: string) => {
    if (!accessToken) {
      alert("Please login to view details");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/vehicle-request/${requestId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (response.ok) {
        const details = await response.json();
        // Show details in alert or modal
        alert(`Request Details:\nName: ${details.name}\nStatus: ${details.status}\nDestination: ${details.destination}\nPurpose: ${details.purpose}`);
      } else {
        alert("Failed to load details");
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      alert("Error loading details");
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 bg-gray-100 min-h-[calc(100vh-70px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!accessToken || !user) {
    return null;
  }

  return (
    <div className="flex justify-between items-start p-10 bg-gray-100 min-h-[calc(100vh-70px)]">
      
      {/* Buttons Section */}
      <div className="flex flex-col gap-6 items-center flex-1 mr-10">
        <button
          className="w-[280px] h-[55px] bg-amber-500 text-white font-semibold text-lg rounded-lg hover:bg-amber-600 transition disabled:bg-gray-400"
          onClick={handleWithinRequest}
        >
          Within
        </button>

        <button
          className="w-[280px] h-[55px] bg-green-700 text-white font-semibold text-lg rounded-lg hover:bg-green-800 transition disabled:bg-gray-400"
          onClick={handleOutOfTownRequest}
        >
          Out of Town
        </button>

        {/* User Info */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md border">
          <p className="text-sm text-gray-600">
            Welcome, <strong>{user.staff_id}</strong>
          </p>
          <p className="text-xs text-gray-500">
            Role: {user.role} | Dept: {user.department}
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchVehicleRequests}
          disabled={loading}
          className="w-[200px] h-[40px] bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Refresh Requests'}
        </button>
      </div>

      {/* Vehicle List Section */}
      <div className="w-[350px] bg-white rounded-xl p-7 shadow-lg border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Vehicles Requisition - Today
          </h3>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            {user.role}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading requests...</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {requests.map((req, index) => (
              <li
                key={req.id || index}
                className="flex justify-between items-center text-sm text-gray-800 border-b border-gray-200 pb-2 last:border-b-0"
              >
                <div>
                  <span className={`font-medium ${
                    req.status === 'Approved' ? 'text-green-600' :
                    req.status === 'Pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    • {req.status} Request: {req.name}
                  </span>
                </div>

                <button
                  onClick={() => handleMoreDetails(req.id || index.toString())}
                  className="text-green-700 font-medium italic hover:underline text-xs"
                >
                  More Details
                </button>
              </li>
            ))}
          </ul>
        )}

        {requests.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-4">No vehicle requests found</p>
        )}
      </div>
    </div>
  );
}