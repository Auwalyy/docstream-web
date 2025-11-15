'use client'

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface FacilityForm {
  name: string;
  address: string;
  serial_no: string;
  take_over: string;
  additionalInfo?: string;
  contactPerson?: string;
}

const AddFacility = () => {
  const router = useRouter();

  const [form, setForm] = useState<FacilityForm>({
    name: "",
    address: "",
    serial_no: "",
    take_over: "",
    additionalInfo: "",
    contactPerson: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/facility/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Error response:", errData);
        alert("❌ Failed to add facility.");
        setLoading(false);
        return;
      }

      alert("✅ Facility added successfully!");
      setForm({
        name: "",
        address: "",
        serial_no: "",
        take_over: "",
        additionalInfo: "",
        contactPerson: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("❌ Something went wrong. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 px-15 relative w-full max-w-7xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center cursor-pointer text-green-600 font-semibold mb-6 hover:underline"
      >
        <ArrowLeft size={20} className="mr-1" />
        <span>Back</span>
      </button>

      <h3 className="text-center mb-8 text-2xl font-semibold text-gray-800">
        Add Facility
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Facility Information Section */}
          <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-center mb-6 text-lg font-semibold text-green-600">
              Facility Information
            </h4>

            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-gray-700">
                  Facility Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter facility name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-gray-700">
                  Serial No
                </label>
                <input
                  type="text"
                  name="serial_no"
                  placeholder="Enter serial number"
                  value={form.serial_no}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-gray-700">
                  Take Over
                </label>
                <input
                  type="text"
                  name="take_over"
                  placeholder="Enter take over info"
                  value={form.take_over}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-center mb-6 text-lg font-semibold text-green-600">
              Additional Information
            </h4>

            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  placeholder="Enter contact person"
                  value={form.contactPerson}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  name="additionalInfo"
                  placeholder="Enter any additional information"
                  value={form.additionalInfo}
                  onChange={handleChange}
                  rows={4}
                  className="p-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-vertical"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            type="submit"
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg cursor-pointer transition-colors hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFacility;