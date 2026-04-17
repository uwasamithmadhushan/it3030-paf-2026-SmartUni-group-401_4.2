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
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-indigo-200 overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Facilities & Assets</h2>
          <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-xl">
            Explore and manage our state-of-the-art campus resources and dedicated learning spaces.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/facilities/add')}
            className="relative z-10 flex-shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 font-black uppercase tracking-widest text-sm px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95"
          >
            + Add New Asset
          </button>
        )}
        
        {/* Abstract shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Glassmorphism Filter Bar */}
      <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-100/50">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Resource Type</label>
            <div className="relative">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full text-sm font-bold text-gray-700 border-2 border-white bg-white/50 rounded-2xl px-5 py-4 appearance-none focus:outline-none focus:border-indigo-300 focus:bg-white transition-all shadow-sm"
              >
                <option value="">All Categories</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Min Capacity</label>
            <input
              type="number"
              name="capacity"
              value={filters.capacity}
              onChange={handleFilterChange}
              min="1"
              placeholder="e.g. 30"
              className="w-full text-sm font-bold text-gray-700 border-2 border-white bg-white/50 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all shadow-sm placeholder:text-gray-300 placeholder:font-normal"
            />
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g. Block A"
              className="w-full text-sm font-bold text-gray-700 border-2 border-white bg-white/50 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all shadow-sm placeholder:text-gray-300 placeholder:font-normal"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={handleClearFilter}
              className="flex-1 md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-600 font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl transition-all active:scale-95"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilter}
              className="flex-[2] md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Locating resources...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 text-center font-bold">
            {error}
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-100 shadow-xl shadow-gray-50 flex flex-col items-center justify-center gap-6">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-6xl shadow-inner relative">
               <span className="relative z-10">🏜️</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">No Resources Found</h3>
              <p className="text-gray-500 font-medium">Try adjusting your filters to find what you're looking for.</p>
            </div>
            <button
              onClick={handleClearFilter}
              className="mt-4 bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
              >
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 rounded-full group-hover:bg-indigo-50/50 transition-colors pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-indigo-100/50">
                    {asset.type === 'LECTURE_HALL' && '🏛️'}
                    {asset.type === 'LAB' && '💻'}
                    {asset.type === 'MEETING_ROOM' && '🤝'}
                    {asset.type === 'EQUIPMENT' && '🔬'}
                    {!['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'].includes(asset.type) && '📁'}
                  </div>
                  <StatusBadge status={asset.status} />
                </div>

                <div className="relative z-10 flex-1 mb-8">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{TYPE_LABELS[asset.type] || asset.type}</p>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">{asset.name}</h3>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="text-lg">📍</span> {asset.location}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1.5"><span className="text-lg">👥</span> {asset.capacity}</span>
                  </div>
                </div>

                <div className="relative z-10 border-t border-gray-50 pt-6 mt-auto">
                  {isAdmin ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/facilities/edit/${asset.id}`)}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        disabled={deleting === asset.id}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all disabled:opacity-50"
                      >
                        {deleting === asset.id ? '...' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/bookings/new?resourceId=${asset.id}`)}
                      disabled={asset.status !== 'ACTIVE'}
                      className="w-full group/btn relative overflow-hidden bg-indigo-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                    >
                      <span className="relative z-10">{asset.status !== 'ACTIVE' ? 'Unavailable' : 'Book Resource'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && !error && assets.length > 0 && (
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center pt-8">{assets.length} Campus Resource(s) Found</p>
      )}
    </div>
  );
}
