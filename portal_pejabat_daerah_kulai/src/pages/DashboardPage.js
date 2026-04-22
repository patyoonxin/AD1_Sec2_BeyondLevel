import React, { useState, useEffect } from 'react';
import { analyticsAPI, complaintAPI } from '../services/api';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    avgResolutionTime: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const complaintResponse = await complaintAPI.getAllComplaints();
      setComplaints(complaintResponse.data);

      const total = complaintResponse.data.length;
      const resolved = complaintResponse.data.filter((c) => c.status === 'resolved').length;
      const pending = complaintResponse.data.filter((c) => c.status === 'pending').length;

      setStats({
        totalComplaints: total,
        resolvedComplaints: resolved,
        pendingComplaints: pending,
        avgResolutionTime: '2.5 hari',
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-xl text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">📊 Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor statistics and manage the system easily</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in">
          {/* Total Complaints */}
          <div className="stat-card border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Complaints</p>
                <p className="stat-value text-blue-600">{stats.totalComplaints}</p>
              </div>
              <div className="stat-icon">📊</div>
            </div>
          </div>

          {/* Resolved Complaints */}
          <div className="stat-card border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Resolved</p>
                <p className="stat-value text-green-600">{stats.resolvedComplaints}</p>
              </div>
              <div className="stat-icon">✅</div>
            </div>
          </div>

          {/* Pending Complaints */}
          <div className="stat-card border-l-4 border-amber-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Pending</p>
                <p className="stat-value text-amber-600">{stats.pendingComplaints}</p>
              </div>
              <div className="stat-icon">⏳</div>
            </div>
          </div>

          {/* Avg Resolution Time */}
          <div className="stat-card border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Avg Resolution Time</p>
                <p className="stat-value text-purple-600">{stats.avgResolutionTime}</p>
              </div>
              <div className="stat-icon">⏱️</div>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="card fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Complaints List</h2>
            <button className="btn btn-secondary btn-sm">
              📥 Export
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">No complaints</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                      <td className="font-medium text-gray-900 max-w-xs truncate">{complaint.title}</td>
                      <td className="text-gray-600">{complaint.category}</td>
                      <td className="text-gray-600">{complaint.user?.name || 'N/A'}</td>
                      <td>
                        <span
                          className={`badge ${
                            complaint.status === 'resolved'
                              ? 'badge-success'
                              : complaint.status === 'in_progress'
                              ? 'badge-primary'
                              : 'badge-warning'
                          }`}
                        >
                          {complaint.status === 'resolved'
                            ? '✅ Resolved'
                            : complaint.status === 'in_progress'
                            ? '⚙️ In Progress'
                            : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="text-gray-600">
                        {new Date(complaint.created_at).toLocaleDateString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
