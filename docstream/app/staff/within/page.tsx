'use client'

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface VehicleForm {
  name: string;
  divison: string;
  vehicle_type: string;
  purpose: string;
  destination: string;
  departure_date: string;
  return_date: string;
  duration_of_trip: string;
}

interface SubmittedData extends VehicleForm {
  division_head_approval: boolean;
  corporate_service_approval: boolean;
  logistics_officer_approval: boolean;
  created_by: number;
}

const WithInRequest = () => {
  const { user, accessToken, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<VehicleForm>({
    name: "",
    divison: "",
    vehicle_type: "",
    purpose: "",
    destination: "",
    departure_date: "",
    return_date: "",
    duration_of_trip: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  // Vehicle type options
  const vehicleOptions = ["Sedan", "SUV", "Minivan", "Pickup Truck", "Minibus"];

  // Division options
  const divisionOptions = [
    "Administration",
    "Finance",
    "Human Resources",
    "Operations",
    "IT",
    "Marketing",
  ];

  // ✅ Set user data when component loads
  useEffect(() => {
    if (!isLoading && user) {
      setForm(prev => ({
        ...prev,
        name: user.staff_id || "",
        divison: user.department || ""
      }));
    }
  }, [user, isLoading]);

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && (!accessToken || !user)) {
      router.push('/');
    }
  }, [accessToken, user, isLoading, router]);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle date change + auto calculate duration
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (updated.departure_date && updated.return_date) {
        const departure = new Date(updated.departure_date);
        const ret = new Date(updated.return_date);
        const duration = Math.max(
          0,
          Math.ceil((ret.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24))
        );
        updated.duration_of_trip = duration.toString();
      }
      return updated;
    });
  };

  // ✅ Form validation
  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Name is required";
    if (!form.divison) return "Division is required";
    if (!form.vehicle_type) return "Vehicle type is required";
    if (!form.purpose.trim()) return "Purpose is required";
    if (!form.destination.trim()) return "Destination is required";
    if (!form.departure_date) return "Departure date is required";
    if (!form.return_date) return "Return date is required";

    const dep = new Date(form.departure_date);
    const ret = new Date(form.return_date);
    if (ret < dep) return "Return date cannot be before departure date";

    return null;
  };

  // ✅ Success popup
  const showSuccessPopup = (data: SubmittedData) => {
    setSubmittedData(data);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 4000);
  };

  // ✅ Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !accessToken) {
      setMessage("❌ You must be logged in to submit requests");
      router.push('/login');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setMessage(`❌ ${validationError}`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const requestData: SubmittedData = {
        ...form,
        division_head_approval: false,
        corporate_service_approval: false,
        logistics_officer_approval: false,
        created_by: user.id,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/vehicle-request/",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send vehicle request");
      }

      const result = await response.json();
      showSuccessPopup(requestData);

      // Reset form but keep user data
      setForm({
        name: user.staff_id || "",
        divison: user.department || "",
        vehicle_type: "",
        purpose: "",
        destination: "",
        departure_date: "",
        return_date: "",
        duration_of_trip: "",
      });
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : 'An error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSubmittedData(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border border-green-200 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border border-green-200">
      {/* User Info Header */}
      <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">
            Vehicle Request (Within Town)
          </h3>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome, <strong>{user.staff_id}</strong></p>
            <p className="text-xs text-gray-500">Role: {user.role} | Dept: {user.department}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-emerald-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Name:
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-emerald-300 bg-white"
            />
          </div>

          {/* Division Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Division:
            </label>
            <select
              name="divison"
              value={form.divison}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-emerald-300 bg-white"
            >
              <option value="">Select Division</option>
              {divisionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Vehicle Type:
            </label>
            <select
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-emerald-300 bg-white"
            >
              <option value="">Select Vehicle Type</option>
              {vehicleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose Field - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Purpose:
            </label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              required
              placeholder="Brief purpose of the trip"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-emerald-300 bg-white resize-vertical"
            />
          </div>

          {/* Destination Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Destination:
            </label>
            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              required
              placeholder="Where are you going?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-emerald-300 bg-white"
            />
          </div>

          {/* Departure Date Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Departure Date:
            </label>
            <input
              type="date"
              name="departure_date"
              value={form.departure_date}
              onChange={handleDateChange}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-emerald-300 bg-white"
            />
          </div>

          {/* Return Date Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Return Date:
            </label>
            <input
              type="date"
              name="return_date"
              value={form.return_date}
              onChange={handleDateChange}
              min={form.departure_date || new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-emerald-300 bg-white"
            />
          </div>

          {/* Duration Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Duration of Trip (days):
            </label>
            <input
              type="number"
              name="duration_of_trip"
              value={form.duration_of_trip}
              onChange={handleChange}
              min="1"
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-emerald-50 text-emerald-700 font-semibold cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none mx-auto block"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </div>
          ) : (
            "Submit Request"
          )}
        </button>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-center font-semibold ${
            message.includes("❌") 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {message}
          </div>
        )}
      </form>

      {/* ✅ Success Popup */}
      {showPopup && submittedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto animate-slideIn">
            {/* Popup Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">✅ Success!</h3>
                <button 
                  onClick={closePopup}
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-colors text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Popup Body */}
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6 text-lg">
                Your vehicle request has been submitted successfully!
              </p>
              
              <div className="bg-emerald-50 p-5 rounded-xl border-l-4 border-emerald-500 mb-6">
                <p className="font-semibold text-gray-800 mb-4 text-lg">
                  Request Details:
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="text-emerald-700 font-semibold">{submittedData.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="font-medium text-gray-700">Division:</span>
                    <span className="text-emerald-700 font-semibold">{submittedData.divison}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="font-medium text-gray-700">Vehicle Type:</span>
                    <span className="text-emerald-700 font-semibold">{submittedData.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="font-medium text-gray-700">Destination:</span>
                    <span className="text-emerald-700 font-semibold">{submittedData.destination}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="font-medium text-gray-700">Departure:</span>
                    <span className="text-emerald-700 font-semibold">{formatDate(submittedData.departure_date)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                    <span className="font-medium text-gray-700">Return:</span>
                    <span className="text-emerald-700 font-semibold">{formatDate(submittedData.return_date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="text-emerald-700 font-semibold">{submittedData.duration_of_trip} days</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-l-4 border-blue-500">
                <p className="text-blue-700 text-sm text-center leading-relaxed">
                  Your request is pending approval. You will be notified once it's processed.
                </p>
              </div>
            </div>

            {/* Popup Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl text-center">
              <button 
                onClick={closePopup}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl min-w-[120px]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithInRequest;