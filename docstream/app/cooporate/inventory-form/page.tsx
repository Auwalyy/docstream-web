'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";

interface InventoryForm {
  retail_outlet: string;
  retail_outlet_address: string;
  pms_opening: string;
  product_recieved: string;
  price_range: string;
  pump_dispensing_level: string;
}

interface User {
  id: number;
  // Add other user properties as needed
  name?: string;
  email?: string;
}

const InventoryForm = () => {
  const [form, setForm] = useState<InventoryForm>({
    retail_outlet: "",
    retail_outlet_address: "",
    pms_opening: "",
    product_recieved: "",
    price_range: "",
    pump_dispensing_level: "",
  });

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Load user info once
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("❌ You must be logged in before submitting inventory!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/v1/inventory-checklist/", {
        ...form,
        created_by: user.id, // ✅ Pass actual user ID
      });

      alert("✅ Inventory submitted successfully!");

      setForm({
        retail_outlet: "",
        retail_outlet_address: "",
        pms_opening: "",
        product_recieved: "",
        price_range: "",
        pump_dispensing_level: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error.response || error);
      alert("❌ Failed to submit inventory. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen rounded-2xl py-8 px-4 flex justify-center items-start">
      <div className="bg-white rounded-xl p-8 w-full max-w-6xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Inventory Checklist</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <input
              type="text"
              name="retail_outlet"
              value={form.retail_outlet}
              onChange={handleChange}
              placeholder="Retail Outlet"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              required
            />
            <input
              type="text"
              name="retail_outlet_address"
              value={form.retail_outlet_address}
              onChange={handleChange}
              placeholder="Retail Outlet Address"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              required
            />
            <input
              type="number"
              name="pms_opening"
              value={form.pms_opening}
              onChange={handleChange}
              placeholder="PMS Opening"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              required
            />
            <input
              type="number"
              name="product_recieved"
              value={form.product_recieved}
              onChange={handleChange}
              placeholder="Product Received"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              required
            />
            <input
              type="text"
              name="price_range"
              value={form.price_range}
              onChange={handleChange}
              placeholder="Price Range"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              required
            />
            <input
              type="number"
              name="pump_dispensing_level"
              value={form.pump_dispensing_level}
              onChange={handleChange}
              placeholder="Pump Dispensing Level"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-lg py-2.5 px-6 mt-8 cursor-pointer transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit Inventory"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;