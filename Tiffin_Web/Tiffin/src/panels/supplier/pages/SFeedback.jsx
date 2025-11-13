import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { supplierAPI } from "../../../services/api"; 

function SFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    rating: "all",
    dateRange: "all"
  });

  const [sortConfig, setSortConfig] = useState({ 
    key: 'feedback_date', 
    direction: 'desc' 
  });

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supplierAPI.getFeedback();
      setFeedbacks(response.data);
      setFilteredFeedbacks(response.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError(err.userMessage || "Failed to fetch feedback data.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...feedbacks];

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

        if (sortConfig.key === 'customer_id.name') {
          aValue = a.customer_id?.name || '';
          bValue = b.customer_id?.name || '';
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

    setFilteredFeedbacks(filtered);
  }, [feedbacks, filters, sortConfig]);

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
    setSortConfig({ key: 'feedback_date', direction: 'desc' });
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== "all").length;

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const deleteFeedback = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    setDeletingId(_id);
    try {
      await supplierAPI.deleteFeedback(_id);
      setFeedbacks(feedbacks.filter((f) => f._id !== _id));
      setFilteredFeedbacks(filteredFeedbacks.filter((f) => f._id !== _id));
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert(err.userMessage || "Failed to delete feedback. Please check the server.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-500">({rating}/5)</span>
      </div>
    );
  };

  // Calculate stats based on filtered feedbacks
  const totalFeedbacks = filteredFeedbacks.length;
  const positiveFeedbacks = filteredFeedbacks.filter(fb => fb.rating >= 4).length;
  const averageRating = filteredFeedbacks.length > 0 
    ? (filteredFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / filteredFeedbacks.length).toFixed(1)
    : "0.0";

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={fetchFeedbacks}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (filteredFeedbacks.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-gray-500 text-lg">
            {feedbacks.length === 0 ? "No feedback available yet." : "No feedback matches your filters."}
          </p>
          <p className="text-gray-400 mt-2">
            {feedbacks.length === 0 
              ? "Customer feedback will appear here once received." 
              : "Try changing your filter criteria."
            }
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header with Stats and Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Showing: <span className="text-blue-600">{totalFeedbacks}</span> of <span className="text-gray-600">{feedbacks.length}</span> feedback
              {activeFilterCount > 0 && (
                <span className="text-blue-500 text-sm ml-2">• {activeFilterCount} filter(s) active</span>
              )}
            </h2>
            <p className="text-sm text-gray-500">Manage your customer reviews and ratings</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="positive">Positive (4-5★)</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
              <option value="negative">Negative (1-2★)</option>
            </select>

            {/* Date Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction });
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="feedback_date-desc">Newest First</option>
              <option value="feedback_date-asc">Oldest First</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
              <option value="customer_id.name-asc">Customer A-Z</option>
              <option value="customer_id.name-desc">Customer Z-A</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition duration-200 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}

            <button
              onClick={fetchFeedbacks}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalFeedbacks}</div>
            <div className="text-sm text-blue-700">Total Feedback</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{positiveFeedbacks}</div>
            <div className="text-sm text-green-700">Positive (4+★)</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{averageRating}</div>
            <div className="text-sm text-purple-700">Average Rating</div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="grid gap-6">
          {filteredFeedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {fb.customer_id?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {fb.customer_id?.name || "Unknown Customer"}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(fb.feedback_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Rating
                      </span>
                      <span className="text-lg font-bold text-gray-900">{fb.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    {renderStars(fb.rating)}
                  </div>

                  <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    {fb.feedback_text}
                  </p>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => deleteFeedback(fb._id)}
                    disabled={deletingId === fb._id}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === fb._id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar with fixed width */}
      <div className="w-64 bg-white shadow-xl">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Feedback</h1>
            <p className="text-gray-600">View and manage customer reviews and ratings</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-white/20">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SFeedback;