'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Calendar, User, Shield, FileText, Search, Filter, Download, Share2 } from "lucide-react";

interface Activity {
  id: number;
  date: string;
  name: string;
  role: string;
  change: string;
  timestamp: string;
}

interface NewActivity {
  activity: string;
  created_by: number | null;
}

interface ApiActivity {
  id: number;
  created_at: string;
  created_by: number;
  activity: string;
  user?: {
    name: string;
    role: string;
  };
}

const ActivityLog = () => {
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<NewActivity>({
    activity: "",
    created_by: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const router = useRouter();

  // Format date to display like "15th February"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  // Format time like "10:30 AM"
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Fetch activity logs from API
  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/v1/activity-log/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiActivity[] = await response.json();
      
      // Transform API data to match our table structure
      const transformedData: Activity[] = result.map(item => ({
        id: item.id,
        date: formatDate(item.created_at),
        name: item.user?.name || `User ${item.created_by}`,
        role: item.user?.role || "Staff",
        change: item.activity,
        timestamp: formatTime(item.created_at)
      }));
      
      setData(transformedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch activity logs: ${errorMessage}`);
      console.error('Error fetching activity logs:', err);
      
      // Fallback to sample data if API fails
      const sampleData: Activity[] = [
        { 
          id: 1, 
          date: "15th February 2024", 
          name: "Abdullahi Isa", 
          role: "Uploader", 
          change: "Uploaded a take over file for facility inspection",
          timestamp: "10:30 AM"
        },
        { 
          id: 2, 
          date: "15th February 2024", 
          name: "Musa Ibrahim", 
          role: "Administrator", 
          change: "Reset password for user account",
          timestamp: "11:45 AM"
        },
        { 
          id: 3, 
          date: "15th February 2024", 
          name: "Sadik Kabir", 
          role: "Uploader", 
          change: "Uploaded general facility documentation",
          timestamp: "02:15 PM"
        },
        { 
          id: 4, 
          date: "14th February 2024", 
          name: "Amina Mohammed", 
          role: "Supervisor", 
          change: "Approved vehicle request for field inspection",
          timestamp: "09:20 AM"
        },
        { 
          id: 5, 
          date: "14th February 2024", 
          name: "Chinedu Okoro", 
          role: "Staff", 
          change: "Submitted inventory checklist for retail outlet",
          timestamp: "03:40 PM"
        },
      ];
      setData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Post new activity to API
  const postActivity = async (activityData: NewActivity) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/activity-log/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Activity posted successfully:', result);
      
      // Refresh the activity list after successful post
      fetchActivityLogs();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to post activity: ${errorMessage}`);
      console.error('Error posting activity:', err);
      throw err;
    }
  };

  // Handle form submission for new activity
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newActivity.activity.trim()) {
      alert('Please enter an activity description');
      return;
    }

    setIsSubmitting(true);
    try {
      await postActivity(newActivity);
      setNewActivity({
        activity: "",
        created_by: null
      });
      alert('Activity logged successfully!');
    } catch (err) {
      alert('Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({
      ...prev,
      [name]: name === 'created_by' ? (value ? parseInt(value) : null) : value
    }));
  };

  // Filter activities based on search and role filter
  const filteredActivities = data.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.change.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || activity.role.toLowerCase() === filterRole.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(data.map(activity => activity.role)));

  // Export activities to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Staff Name', 'Role', 'Activity'];
    const csvData = filteredActivities.map(activity => [
      activity.date,
      activity.timestamp,
      activity.name,
      activity.role,
      activity.change
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Share activity log
  const shareLog = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Activity Log',
        text: `Activity Log Summary - ${filteredActivities.length} activities`,
        url: window.location.href,
      });
    } else {
      alert('Web Share API not supported in your browser. You can copy the URL manually.');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Check if form is valid for submission
  const isFormValid = newActivity.activity.trim() !== "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-white"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Activity Log</h1>
          </div>
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading activity logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-white"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Activity Log</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Total Activities</h4>
            <p className="text-2xl font-bold text-blue-600">{data.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Today</h4>
            <p className="text-2xl font-bold text-green-600">
              {data.filter(activity => activity.date.includes('15th February')).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">This Week</h4>
            <p className="text-2xl font-bold text-purple-600">{data.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Active Users</h4>
            <p className="text-2xl font-bold text-orange-600">
              {Array.from(new Set(data.map(activity => activity.name))).length}
            </p>
          </div>
        </div>

        {/* Add New Activity Form */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus size={20} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Add New Activity</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="activity" className="block text-sm font-semibold text-gray-700 mb-3">
                  Activity Description *
                </label>
                <input
                  type="text"
                  id="activity"
                  name="activity"
                  value={newActivity.activity}
                  onChange={handleInputChange}
                  placeholder="Describe the activity..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label htmlFor="created_by" className="block text-sm font-semibold text-gray-700 mb-3">
                  User ID
                </label>
                <input
                  type="number"
                  id="created_by"
                  name="created_by"
                  value={newActivity.created_by || ''}
                  onChange={handleInputChange}
                  placeholder="Enter user ID (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                type="submit" 
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  !isFormValid || isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
                disabled={!isFormValid || isSubmitting}
              >
                <Plus size={18} />
                {isSubmitting ? 'Logging Activity...' : 'Log Activity'}
              </button>
              
              <button 
                type="button"
                onClick={() => setNewActivity({ activity: "", created_by: null })}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search activities, names, or roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <button 
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  <Download size={18} />
                  <span>Export</span>
                </button>
                
                <button 
                  onClick={shareLog}
                  className="flex items-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText size={20} />
              Activity History ({filteredActivities.length} activities)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Date & Time
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Staff Name
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Shield size={16} />
                      Role
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">
                    Activity Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-600 font-medium">{activity.date}</span>
                          <span className="text-xs text-gray-400">{activity.timestamp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-800 font-semibold">{activity.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activity.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{activity.change}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <FileText size={48} />
                        <p className="text-lg font-medium">No activities found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;