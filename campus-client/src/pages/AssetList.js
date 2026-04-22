import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAssets, deleteAsset } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

export default function AssetList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const [filters, setFilters] = useState({ type: '', capacity: '', location: '' });

  const fetchAssets = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllAssets(params);
      setAssets(res.data);
    } catch {
      setError('Failed to load assets. Ensure the backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets({});
  }, [fetchAssets]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyFilter = () => {
    fetchAssets(filters);
  };

  const handleClearFilter = () => {
    const empty = { type: '', capacity: '', location: '' };
    setFilters(empty);
    fetchAssets({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    setDeleting(id);
    try {
      await deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Failed to delete asset.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Facilities & Assets</h2>
          <p className="text-sm text-gray-500 mt-1">Manage campus resources and facilities</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/facilities/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow"
          >
            + Add New Asset
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter Resources</p>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Type dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Resource Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Min Capacity */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Min Capacity</label>
            <input
              type="number"
              name="capacity"
              value={filters.capacity}
              onChange={handleFilterChange}
              min="1"
              placeholder="e.g. 30"
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g. Block A"
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            onClick={handleApplyFilter}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleClearFilter}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading assets...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm">{error}</div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-2">
            <span className="text-4xl">🏛️</span>
            No assets found. Try clearing the filter or adding a new asset.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Type', 'Capacity', 'Location', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800">{asset.name}</td>
                  <td className="px-5 py-4 text-gray-600">{TYPE_LABELS[asset.type] || asset.type}</td>
                  <td className="px-5 py-4 text-gray-600">{asset.capacity}</td>
                  <td className="px-5 py-4 text-gray-600">{asset.location}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => navigate(`/facilities/edit/${asset.id}`)}
                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            disabled={deleting === asset.id}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleting === asset.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/bookings/new?resourceId=${asset.id}`)}
                          disabled={asset.status !== 'ACTIVE'}
                          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={asset.status !== 'ACTIVE' ? 'Resource not available' : 'Book this resource'}
                        >
                          📅 Book
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-gray-400 text-right">{assets.length} record(s) shown</p>
      )}
    </div>
  );
}
