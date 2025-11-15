'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Download, Printer, Plus, Search, Filter, Trash2, Eye } from "lucide-react";

interface Staff {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  phone?: string;
  employee_id?: string;
}

const StaffManagement = () => {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ✅ Fetch staff from API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://127.0.0.1:8000/api/v1/staff/");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff data: ${response.status} ${response.statusText}`);
      }
      
      const data: Staff[] = await response.json();
      setStaffList(data);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching staff data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Deactivate staff member
  const deactivateStaff = async (id: number) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) {
      return;
    }

    try {
      setActionLoading(id);
      const response = await fetch(`http://127.0.0.1:8000/api/v1/staff/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'inactive' })
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate staff');
      }

      // Refresh the staff list
      await fetchStaff();
      alert('Staff member deactivated successfully');
    } catch (err) {
      console.error('Error deactivating staff:', err);
      alert('Failed to deactivate staff member. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Activate staff member
  const activateStaff = async (id: number) => {
    try {
      setActionLoading(id);
      const response = await fetch(`http://127.0.0.1:8000/api/v1/staff/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (!response.ok) {
        throw new Error('Failed to activate staff');
      }

      // Refresh the staff list
      await fetchStaff();
      alert('Staff member activated successfully');
    } catch (err) {
      console.error('Error activating staff:', err);
      alert('Failed to activate staff member. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Delete staff member
  const deleteStaff = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(id);
      const response = await fetch(`http://127.0.0.1:8000/api/v1/staff/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff');
      }

      // Refresh the staff list
      await fetchStaff();
      alert('Staff member deleted successfully');
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Failed to delete staff member. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (staff: Staff) => {
    router.push(`/staff-management/edit/${staff.id}`);
  };

  const handleView = (staff: Staff) => {
    router.push(`/staff-management/view/${staff.id}`);
  };

  const handleAddStaff = () => {
    router.push("/ict/staff-management/add-staff");
  };

  const handleExport = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/staff/export/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `staff-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('Staff data exported successfully');
    } catch (err) {
      console.error('Error exporting staff:', err);
      alert('Failed to export staff data. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter staff based on search and filters
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || staff.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || staff.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const uniqueDepartments = Array.from(new Set(staffList.map(staff => staff.department)));

  // Fetch data on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading staff data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage your organization's staff members and their roles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Total Staff</h4>
            <p className="text-2xl font-bold text-emerald-600">{staffList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Active</h4>
            <p className="text-2xl font-bold text-green-600">
              {staffList.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Departments</h4>
            <p className="text-2xl font-bold text-blue-600">{uniqueDepartments.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Inactive</h4>
            <p className="text-2xl font-bold text-red-600">
              {staffList.filter(s => s.status === 'inactive').length}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Header with Add Button */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <button
              className="flex items-center gap-2 bg-emerald-600 text-white border-none py-3 px-6 rounded-xl font-semibold cursor-pointer hover:bg-emerald-700 transition-colors"
              onClick={handleAddStaff}
            >
              <Plus size={20} />
              Add New Staff
            </button>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={fetchStaff}
                className="mt-2 text-red-700 underline text-sm hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-emerald-800 text-sm border-b border-gray-200">
                    Staff Member
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-emerald-800 text-sm border-b border-gray-200">
                    Department
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-emerald-800 text-sm border-b border-gray-200">
                    Role
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-emerald-800 text-sm border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-emerald-800 text-sm border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{staff.name}</p>
                          <p className="text-sm text-gray-500">{staff.email}</p>
                          {staff.employee_id && (
                            <p className="text-xs text-gray-400">ID: {staff.employee_id}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-700">{staff.department}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-700">{staff.role}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          staff.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(staff)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleEdit(staff)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Staff"
                          >
                            <Pencil size={18} />
                          </button>
                          
                          {staff.status === 'active' ? (
                            <button
                              onClick={() => deactivateStaff(staff.id)}
                              disabled={actionLoading === staff.id}
                              className="bg-red-500 text-white border-none py-2 px-3 rounded-lg cursor-pointer font-medium hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === staff.id ? '...' : 'Deactivate'}
                            </button>
                          ) : (
                            <button
                              onClick={() => activateStaff(staff.id)}
                              disabled={actionLoading === staff.id}
                              className="bg-green-500 text-white border-none py-2 px-3 rounded-lg cursor-pointer font-medium hover:bg-green-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === staff.id ? '...' : 'Activate'}
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteStaff(staff.id, staff.name)}
                            disabled={actionLoading === staff.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Staff"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {staffList.length === 0 ? 
                        "No staff members found. Add your first staff member to get started." : 
                        "No staff members found matching your criteria."
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Export Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {filteredStaff.length} of {staffList.length} staff members
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-amber-500 text-white border-none py-3 px-6 rounded-xl font-semibold cursor-pointer hover:bg-amber-600 transition-colors"
              >
                <Download size={20} />
                Export as Excel
              </button>
              
              <button 
                onClick={handlePrint}
                className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200"
                title="Print"
              >
                <Printer size={20} />
              </button>

              <button 
                onClick={fetchStaff}
                className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                title="Refresh"
              >
                ↻
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;