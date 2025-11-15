'use client'

import React, { useState } from "react";

interface Item {
  id: number;
  description: string;
  unit: string;
  quantity: string;
  allocation: string;
}

interface RequestState {
  name: string;
  uniqueId: string;
  division: string;
  items: Item[];
}

interface ItemState {
  description: string;
  unit: string;
  quantity: string;
  allocation: string;
}

const RequestItems = () => {
  const [request, setRequest] = useState<RequestState>({
    name: "",
    uniqueId: "",
    division: "",
    items: [],
  });

  const [item, setItem] = useState<ItemState>({
    description: "",
    unit: "",
    quantity: "",
    allocation: "",
  });

  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedItemsCount, setSubmittedItemsCount] = useState(0);

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!item.description || !item.unit || !item.quantity || !item.allocation) {
      setMessage("❌ Please fill all item fields before adding");
      return;
    }

    setRequest((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now() }],
    }));
    setItem({ description: "", unit: "", quantity: "", allocation: "" });
    setMessage("");
  };

  const handleRemoveItem = (index: number) => {
    setRequest((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const showSuccessPopup = (itemsCount: number) => {
    setSubmittedItemsCount(itemsCount);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  const handleSubmit = async () => {
    if (request.items.length === 0) {
      setMessage("❌ Please add at least one item before submitting");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        items: request.items,
        created_by: 1,
      };

      const response = await fetch("http://127.0.0.1:8000/api/v1/item-request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        showSuccessPopup(request.items.length);
        setRequest({
          name: "",
          uniqueId: "",
          division: "",
          items: [],
        });
      } else {
        setMessage(`❌ Failed: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 bg-white min-h-screen font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-6 mb-6 shadow-2xl shadow-emerald-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-radial-gradient circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%) rounded-full"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="text-4xl bg-white/10 p-5 rounded-2xl backdrop-blur-sm">📦</div>
          <div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Item Request</h1>
            <p className="text-lg opacity-90 font-normal">Submit your item requirements for approval</p>
          </div>
        </div>
      </div>

      {/* Item Input Form */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">➕</span>
              <h2 className="text-xl font-semibold text-emerald-700">Add New Item</h2>
            </div>
            <div className="text-gray-600 text-sm ml-9">Fill in the details below</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="flex items-center gap-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                <span className="text-base">📝</span>
                Description
              </label>
              <input
                id="description"
                name="description"
                value={item.description}
                onChange={handleItemChange}
                placeholder="Enter item description"
                required
                className="w-full p-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-sm outline-none transition-all duration-300 focus:border-emerald-600 focus:bg-white font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="unit" className="flex items-center gap-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                <span className="text-base">⚖️</span>
                Unit
              </label>
              <input
                id="unit"
                name="unit"
                value={item.unit}
                onChange={handleItemChange}
                placeholder="e.g., pieces, kg, liters"
                required
                className="w-full p-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-sm outline-none transition-all duration-300 focus:border-emerald-600 focus:bg-white font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="quantity" className="flex items-center gap-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                <span className="text-base">🔢</span>
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={item.quantity}
                onChange={handleItemChange}
                placeholder="Enter quantity"
                min="1"
                required
                className="w-full p-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-sm outline-none transition-all duration-300 focus:border-emerald-600 focus:bg-white font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="allocation" className="flex items-center gap-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                <span className="text-base">🎯</span>
                Allocation
              </label>
              <input
                id="allocation"
                name="allocation"
                value={item.allocation}
                onChange={handleItemChange}
                placeholder="Allocation details"
                required
                className="w-full p-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-sm outline-none transition-all duration-300 focus:border-emerald-600 focus:bg-white font-medium placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none py-3.5 px-8 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-emerald-300 hover:shadow-xl hover:shadow-emerald-400 hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              onClick={handleAddItem}
              disabled={!item.description || !item.unit || !item.quantity || !item.allocation}
            >
              <span className="text-lg font-bold">+</span>
              Add Item to List
            </button>
          </div>
        </div>
      </div>

      {/* Items List Section */}
      {request.items.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <h2 className="text-xl font-semibold text-emerald-700">Requested Items</h2>
              </div>
              <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                {request.items.length} {request.items.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <div className="min-w-[900px]">
                {/* Table Header */}
                <div className="grid grid-cols-[60px_2fr_1fr_1fr_1.5fr_80px] bg-emerald-600 text-white py-4 px-6 font-semibold text-xs uppercase tracking-wider">
                  <div className="px-3">#</div>
                  <div className="px-3">Description</div>
                  <div className="px-3">Unit</div>
                  <div className="px-3">Quantity</div>
                  <div className="px-3">Allocation</div>
                  <div className="px-3">Action</div>
                </div>

                {/* Table Body */}
                <div className="bg-white">
                  {request.items.map((item, index) => (
                    <div 
                      key={item.id}
                      className="grid grid-cols-[60px_2fr_1fr_1fr_1.5fr_80px] py-4 px-6 border-b border-gray-100 items-center transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="px-3">
                        <div className="bg-emerald-50 text-emerald-700 py-2 px-3 rounded-lg font-bold text-sm text-center border border-emerald-200">
                          {index + 1}
                        </div>
                      </div>
                      <div className="px-3 font-medium text-gray-900 leading-relaxed">{item.description}</div>
                      <div className="px-3">
                        <span className="bg-emerald-50 text-emerald-700 py-2 px-3.5 rounded-full text-xs font-semibold border border-emerald-300">
                          {item.unit}
                        </span>
                      </div>
                      <div className="px-3">
                        <span className="bg-emerald-600 text-white py-2 px-4 rounded-lg font-bold text-sm inline-block min-w-[60px] text-center shadow-lg shadow-emerald-300">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="px-3">
                        <div className="bg-gray-50 py-2.5 px-3.5 rounded-lg border-l-4 border-emerald-600 text-sm leading-snug text-gray-600">
                          {item.allocation}
                        </div>
                      </div>
                      <div className="px-3">
                        <button 
                          className="bg-red-50 text-red-600 border border-red-200 w-9 h-9 rounded-lg cursor-pointer flex items-center justify-center text-lg font-bold transition-all duration-200 hover:bg-red-600 hover:text-white hover:scale-105"
                          onClick={() => handleRemoveItem(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Footer */}
                <div className="bg-gray-50 py-5 px-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700 text-sm">Total Items:</span>
                      <span className="bg-emerald-600 text-white py-1.5 px-3.5 rounded-full font-bold text-sm">
                        {request.items.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Section */}
      {request.items.length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-8 shadow-2xl shadow-emerald-300">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🚀</div>
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold">Ready to Submit</div>
                  <div className="opacity-90 text-sm">Your request is complete and ready for processing</div>
                </div>
              </div>
              <button 
                className="bg-white text-emerald-700 border-none py-4 px-9 rounded-2xl cursor-pointer text-base font-bold transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:-translate-y-1 disabled:bg-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-transparent border-t-emerald-700 rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="text-lg">📨</span>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-5 rounded-2xl overflow-hidden shadow-lg ${
          message.includes('❌') 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-emerald-50 border border-emerald-200'
        }`}>
          <div className="flex items-center gap-3 p-4 font-semibold">
            <span className="text-lg">{message.includes('❌') ? '⚠️' : '✅'}</span>
            <span className={message.includes('❌') ? 'text-red-700' : 'text-emerald-700'}>
              {message}
            </span>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-5 backdrop-blur-sm animate-fadeIn"
          onClick={closePopup}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-slideIn border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="text-3xl font-bold">✓</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Request Submitted</h3>
                  <p className="opacity-90">Successfully sent for approval</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-600 text-sm">Items Count</span>
                  <span className="font-bold text-emerald-700 text-base">{submittedItemsCount} items</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-600 text-sm">Submission Time</span>
                  <span className="font-bold text-emerald-700 text-base">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-600 text-sm">Date</span>
                  <span className="font-bold text-emerald-700 text-base">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500">
                <div className="text-2xl">💡</div>
                <p className="text-blue-800 text-sm leading-relaxed font-medium m-0">
                  You will receive a notification once your request is processed
                </p>
              </div>
            </div>

            <div className="px-8 pb-8 bg-gray-50 text-center border-t border-gray-200">
              <button 
                className="bg-emerald-600 text-white border-none py-3.5 px-8 rounded-xl cursor-pointer text-base font-semibold transition-all duration-300 min-w-[120px] shadow-lg shadow-emerald-300 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-400"
                onClick={closePopup}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestItems;