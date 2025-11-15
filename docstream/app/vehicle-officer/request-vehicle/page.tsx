'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface VehicleRequest {
  id: number;
  name: string;
  divison: string;
  vehicle_type: string;
  purpose: string;
  destination: string;
  departure_date: string;
  return_date: string;
  duration_of_trip: number;
  division_head_approval: boolean;
  corporate_service_approval: boolean;
  logistics_officer_approval: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export default function VehicleOfficerRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const fetchVehicleRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/v1/vehicle-request");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.status}`);
      }
      
      const data: VehicleRequest[] = await response.json();
      setRequests(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error('Error fetching vehicle requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve a vehicle request as logistics officer via proxy
  const approveRequest = async (requestId: number) => {
    try {
      setApprovingId(requestId);
      const response = await fetch(`http://127.0.0.1:8000/api/v1/vehicle-request?id=${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logistics_officer_approval: true
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve request");
      }

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, logistics_officer_approval: true }
          : req
      ));
      
      alert("Vehicle request approved successfully!");
    } catch (err) {
      console.error('Error approving request:', err);
      alert("Failed to approve request. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  // Reject a vehicle request
  const rejectRequest = async (requestId: number) => {
    if (!window.confirm("Are you sure you want to reject this vehicle request?")) {
      return;
    }

    try {
      setApprovingId(requestId);
      const response = await fetch(`http://127.0.0.1:8000/api/v1/vehicle-request?id=${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logistics_officer_approval: false
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, logistics_officer_approval: false }
          : req
      ));
      
      alert("Vehicle request rejected!");
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert("Failed to reject request. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge style
  const getStatusBadge = (request: VehicleRequest) => {
    if (!request.division_head_approval) {
      return "bg-gray-100 text-gray-800";
    }
    if (request.logistics_officer_approval) {
      return "bg-green-100 text-green-800";
    }
    if (request.logistics_officer_approval === false) {
      return "bg-red-100 text-red-800";
    }
    return "bg-yellow-100 text-yellow-800";
  };

  // Get status text
  const getStatusText = (request: VehicleRequest) => {
    if (!request.division_head_approval) {
      return "Awaiting Division Approval";
    }
    if (request.logistics_officer_approval) {
      return "Vehicle Approved";
    }
    if (request.logistics_officer_approval === false) {
      return "Vehicle Rejected";
    }
    return "Pending Vehicle Assignment";
  };

  // Filter requests - show pending first, then approved/rejected
  const sortedRequests = [...requests].sort((a, b) => {
    // Priority: Pending > Approved > Rejected > Awaiting Division
    if (!a.division_head_approval && b.division_head_approval) return 1;
    if (a.division_head_approval && !b.division_head_approval) return -1;
    if (a.logistics_officer_approval === null && b.logistics_officer_approval !== null) return -1;
    if (a.logistics_officer_approval !== null && b.logistics_officer_approval === null) return 1;
    return 0;
  });

  // Get requests that need vehicle officer attention
  const pendingRequests = requests.filter(req => 
    req.division_head_approval && req.logistics_officer_approval === null
  );

  useEffect(() => {
    fetchVehicleRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 bg-gray-100 min-h-[calc(100vh-70px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start p-6 bg-gray-100 min-h-[calc(100vh-70px)] gap-8">
      
      {/* Main Content - Vehicle Requests */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vehicle Officer Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage vehicle assignments and approvals</p>
          </div>
          <button
            onClick={fetchVehicleRequests}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>↻</span>
            Refresh
          </button>
        </div>

       

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Total Requests</h3>
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Pending Assignment</h3>
            <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-1">Vehicle Assigned</h3>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(req => req.logistics_officer_approval).length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-1">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(req => req.logistics_officer_approval === false).length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No vehicle requests found.</p>
              <p className="text-sm">When staff submit vehicle requests, they will appear here for approval.</p>
            </div>
          ) : (
            sortedRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">{request.name}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request)}`}>
                        {getStatusText(request)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Division:</span> {request.divison}
                      </div>
                      <div>
                        <span className="font-medium">Vehicle Type:</span> {request.vehicle_type}
                      </div>
                      <div>
                        <span className="font-medium">Destination:</span> {request.destination}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {request.duration_of_trip} days
                      </div>
                      <div>
                        <span className="font-medium">Departure:</span> {formatDate(request.departure_date)}
                      </div>
                      <div>
                        <span className="font-medium">Return:</span> {formatDate(request.return_date)}
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className="font-medium text-sm text-gray-700">Purpose:</span>
                      <p className="text-sm text-gray-600 mt-1">{request.purpose}</p>
                    </div>

                    {/* Approval Status */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                      <span className={`inline-flex items-center px-2 py-1 rounded ${
                        request.division_head_approval 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        Division: {request.division_head_approval ? '✓ Approved' : '⏳ Pending'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded ${
                        request.logistics_officer_approval === true 
                          ? 'bg-green-100 text-green-800' 
                          : request.logistics_officer_approval === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Vehicle: {
                          request.logistics_officer_approval === true ? '✓ Assigned' :
                          request.logistics_officer_approval === false ? '✗ Rejected' :
                          '⏳ Pending'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {request.division_head_approval && request.logistics_officer_approval === null ? (
                      <>
                        <button
                          onClick={() => approveRequest(request.id)}
                          disabled={approvingId === request.id}
                          className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {approvingId === request.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Assigning...
                            </div>
                          ) : (
                            "Assign Vehicle"
                          )}
                        </button>
                        <button
                          onClick={() => rejectRequest(request.id)}
                          disabled={approvingId === request.id}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </>
                    ) : request.logistics_officer_approval ? (
                      <span className="bg-green-100 text-green-800 py-2 px-4 rounded-lg font-medium text-center text-sm">
                        ✓ Vehicle Assigned
                      </span>
                    ) : request.logistics_officer_approval === false ? (
                      <span className="bg-red-100 text-red-800 py-2 px-4 rounded-lg font-medium text-center text-sm">
                        ✗ Request Rejected
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-medium text-center text-sm">
                        ⏳ Awaiting Division
                      </span>
                    )}
                    
                    <button
                      onClick={() => {
                        // Show more details
                        alert(`Request Details:\n\nName: ${request.name}\nDivision: ${request.divison}\nVehicle: ${request.vehicle_type}\nDestination: ${request.destination}\nPurpose: ${request.purpose}\nDeparture: ${formatDate(request.departure_date)}\nReturn: ${formatDate(request.return_date)}\nDuration: ${request.duration_of_trip} days\n\nDivision Approval: ${request.division_head_approval ? 'Approved' : 'Pending'}\nVehicle Assignment: ${request.logistics_officer_approval === true ? 'Assigned' : request.logistics_officer_approval === false ? 'Rejected' : 'Pending'}`);
                      }}
                      className="text-green-700 font-medium hover:underline text-sm text-center"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions Sidebar */}
      <div className="w-full lg:w-80 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>

        <div className="space-y-4 mb-6">
          <button
            className="w-full h-14 bg-amber-500 text-white font-semibold text-lg rounded-xl hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
            onClick={() => router.push("/vehicle-officer/request-vehicle/within")}
          >
            Within Town Requests
          </button>

          <button
            className="w-full h-14 bg-green-700 text-white font-semibold text-lg rounded-xl hover:bg-green-800 transition-colors shadow-md hover:shadow-lg"
            onClick={() => router.push("/vehicle-officer/request-vehicle/out-of-town")}
          >
            Out of Town Requests
          </button>
        </div>

        {/* Recent Activity */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Pending Assignments</h4>
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="flex justify-between items-center text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-b-0"
              >
                <span className="flex-1">
                  <span className="inline-block w-2 h-2 rounded-full mr-2 bg-yellow-500"></span>
                  {request.name} - {request.vehicle_type}
                </span>
                <span className="text-xs font-medium text-yellow-600">
                  {request.destination}
                </span>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">No pending assignments</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium text-gray-700 mb-3">Today's Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>New Requests:</span>
              <span className="font-medium">{requests.filter(req => 
                new Date(req.created_at).toDateString() === new Date().toDateString()
              ).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicles Assigned:</span>
              <span className="font-medium text-green-600">
                {requests.filter(req => 
                  req.logistics_officer_approval && 
                  new Date(req.updated_at).toDateString() === new Date().toDateString()
                ).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Awaiting Action:</span>
              <span className="font-medium text-yellow-600">{pendingRequests.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}