import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "admin-token";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states for each column
  const [filters, setFilters] = useState({
    rating: "all",
    dateRange: "all"
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/feedback");
      const feedbackData = response.data || [];
      setFeedbackList(feedbackData);
      setFilteredFeedback(feedbackData);
    } catch (err) {
      console.error("❌ Error fetching feedback:", err);
      setError("Failed to load feedback data. Please check if the server is running.");
      
      const demoFeedback = [
        {
          _id: "1",
          customer_id: { name: "Ravi Patel", email: "ravi.patel@example.com" },
          rating: 5,
          feedback_text: "Amazing food and quick service!",
          feedback_date: new Date().toISOString(),
        },
        {
          _id: "2", 
          customer_id: { name: "Meena Shah", email: "meena.shah@example.com" },
          rating: 3,
          feedback_text: "Food was okay, but delivery was late.",
          feedback_date: new Date().toISOString(),
        },
        {
          _id: "3",
          customer_id: { name: "Amit Desai", email: "amit.desai@example.com" },
          rating: 4,
          feedback_text: "Great taste, will order again!",
          feedback_date: new Date().toISOString(),
        },
      ];
      setFeedbackList(demoFeedback);
      setFilteredFeedback(demoFeedback);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...feedbackList];

    // Rating filter
    if (filters.rating !== "all") {
      filtered = filtered.filter(fb => {
        const rating = fb.rating;
        switch (filters.rating) {
          case "5": return rating === 5;
          case "4": return rating === 4;
          case "3": return rating === 3;
          case "2": return rating === 2;
          case "1": return rating === 1;
          case "positive": return rating >= 4;
          case "negative": return rating <= 2;
          default: return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      filtered = filtered.filter(fb => {
        const feedbackDate = new Date(fb.feedback_date);
        const diffTime = Math.abs(now - feedbackDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case "today": return diffDays <= 1;
          case "week": return diffDays <= 7;
          case "month": return diffDays <= 30;
          default: return true;
        }
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'rating') {
          aValue = parseInt(aValue);
          bValue = parseInt(bValue);
        }

        if (sortConfig.key === 'feedback_date') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Default sort by latest feedback if no sort config
    if (!sortConfig.key) {
      filtered.sort((a, b) => new Date(b.feedback_date) - new Date(a.feedback_date));
    }

    setFilteredFeedback(filtered);
  }, [feedbackList, filters, sortConfig]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearAllFilters = () => {
    setFilters({
      rating: "all",
      dateRange: "all"
    });
    setSortConfig({ key: null, direction: 'asc' });
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== "all").length;

  const renderStars = (count) => {
    return "⭐".repeat(count) + "☆".repeat(5 - count);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
        <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Customer Feedback</h1>
            <p className="text-gray-600 mt-2">Read and manage feedback from your customers</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading feedback data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Customer Feedback</h1>
          <p className="text-gray-600 mt-2">
            View customer feedback and ratings ({filteredFeedback.length} of {feedbackList.length} feedback)
            {activeFilterCount > 0 && (
              <span className="text-blue-600 font-semibold"> • {activeFilterCount} filter(s) active</span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear Filters</span>
            </button>
          )}
          <button
            onClick={fetchFeedback}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Feedback</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <p className="text-red-800 font-semibold text-sm">Database Connection Issue</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors shadow-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-3xl font-bold text-blue-600">{filteredFeedback.length}</div>
          <div className="text-sm text-gray-600 mt-1">Showing Feedback</div>
          <div className="text-xs text-green-600 mt-1">Live Database</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-3xl font-bold text-yellow-600">
            {filteredFeedback.filter(fb => fb.rating >= 4).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Positive Ratings (4+ stars)</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all duration-300">
          <div className="text-3xl font-bold text-green-600">
            {filteredFeedback.length > 0 
              ? (filteredFeedback.reduce((sum, fb) => sum + fb.rating, 0) / filteredFeedback.length).toFixed(1)
              : "0.0"
            }
          </div>
          <div className="text-sm text-gray-600 mt-1">Average Rating</div>
        </div>
      </div>

      {/* Feedback Table with Built-in Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-600">
              {feedbackList.length === 0 ? "No Feedback Yet" : "No Feedback Found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {feedbackList.length === 0 
                ? "Customer feedback will appear here when they submit reviews." 
                : "No feedback matches your current filters."
              }
            </p>
            <div className="flex justify-center gap-3">
              {activeFilterCount > 0 && (
                <button 
                  onClick={clearAllFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              )}
              <button 
                onClick={fetchFeedback}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  {/* Customer - Only Sort */}
                  <th className="w-48 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Customer</span>
                    </div>
                  </th>

                  {/* Rating - With Filter and Sort */}
                  <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Rating</span>
                        <button 
                          onClick={() => handleSort('rating')}
                          className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                          {sortConfig.key === 'rating' ? (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          ) : '↕'}
                        </button>
                      </div>
                      <select
                        value={filters.rating}
                        onChange={(e) => handleFilterChange("rating", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Ratings</option>
                        <option value="positive">Positive (4-5 stars)</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                        <option value="negative">Negative (1-2 stars)</option>
                      </select>
                    </div>
                  </th>

                  {/* Feedback - Only Content */}
                  <th className="w-64 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Feedback
                  </th>

                  {/* Date - With Filter and Sort */}
                  <th className="w-32 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Date</span>
                        <button 
                          onClick={() => handleSort('feedback_date')}
                          className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                          {sortConfig.key === 'feedback_date' ? (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          ) : '↕'}
                        </button>
                      </div>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredFeedback.map((fb) => (
                  <tr key={fb._id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-3 py-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {fb.customer_id?.name || "Unknown Customer"}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {fb.customer_id?.email || "No email"}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-yellow-500 text-sm">{renderStars(fb.rating)}</span>
                        <span className="text-xs text-gray-600 font-medium">({fb.rating}/5)</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="max-w-xs">
                        <p className="text-gray-800 text-sm line-clamp-2">
                          {fb.feedback_text || "No feedback message"}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                      {fb.feedback_date 
                        ? new Date(fb.feedback_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "N/A"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table Info Footer */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Showing {filteredFeedback.length} of {feedbackList.length} feedback
          {activeFilterCount > 0 && (
            <span className="text-blue-600 font-semibold"> • {activeFilterCount} filter(s) applied</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Feedback;