import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAssets, deleteAsset } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Research Lab',
  MEETING_ROOM: 'Executive Suite',
  EQUIPMENT: 'Precision Equipment',
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
      setError('Failed to load assets. Cloud synchronization error.');
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
    if (!window.confirm('Are you sure you want to decommission this resource?')) return;
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

  if (loading) return <LoadingSpinner fullScreen message="Consulting Archive..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-luxury font-['Outfit']">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-ivory-warm/10">
        <div>
           <h1 className="text-4xl font-black text-ivory-warm tracking-tight">Facility Portfolio</h1>
           <p className="text-sm font-bold text-blush-soft uppercase tracking-widest mt-2">Campus Assets & Executive Suites</p>
        </div>
        <div className="flex items-center gap-4">
           {isAdmin && (
             <button
               onClick={() => navigate('/facilities/add')}
               className="luxury-button"
             >
               Add New Asset
             </button>
           )}
        </div>
      </div>

      {/* Luxury Filter Bar */}
      <div className="luxury-card !p-8 bg-violet-deep/20">
        <div className="flex flex-wrap gap-8 items-end">
          <div className="flex-1 min-w-[240px] space-y-3">
            <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-2">Resource Category</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="luxury-input appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div className="w-40 space-y-3">
            <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-2">Min Capacity</label>
            <input
              type="number"
              name="capacity"
              value={filters.capacity}
              onChange={handleFilterChange}
              placeholder="Ex: 50"
              className="luxury-input"
            />
          </div>

          <div className="flex-1 min-w-[240px] space-y-3">
            <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-2">Location Hub</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Ex: Executive Wing"
              className="luxury-input"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleApplyFilter}
              className="px-8 py-3 rounded-xl bg-ivory-warm text-plum-dark font-black text-xs uppercase tracking-widest hover:bg-blush-soft transition-all"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilter}
              className="px-8 py-3 rounded-xl bg-white/5 text-ivory-warm border border-ivory-warm/10 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-400 flex items-center gap-3">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
           {error}
        </div>
      )}

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assets.map((asset) => (
          <div key={asset.id} className="luxury-card group hover:-translate-y-2">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-deep to-wine-muted flex items-center justify-center text-2xl shadow-soft group-hover:rotate-6 transition-all duration-500">
                {asset.type === 'LECTURE_HALL' ? '🏛️' : asset.type === 'LAB' ? '🧪' : asset.type === 'MEETING_ROOM' ? '💼' : '🛠️'}
              </div>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${asset.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                {asset.status}
              </span>
            </div>

            <h3 className="text-xl font-black text-ivory-warm mb-2 group-hover:text-blush-soft transition-colors">{asset.name}</h3>
            <p className="text-xs font-bold text-ivory-warm/40 uppercase tracking-widest mb-6">{TYPE_LABELS[asset.type] || asset.type}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-4 rounded-xl bg-plum-dark/40 border border-ivory-warm/5">
                  <p className="text-[9px] font-black text-blush-soft uppercase tracking-widest mb-1">Capacity</p>
                  <p className="text-sm font-bold text-ivory-warm">{asset.capacity} Seats</p>
               </div>
               <div className="p-4 rounded-xl bg-plum-dark/40 border border-ivory-warm/5">
                  <p className="text-[9px] font-black text-blush-soft uppercase tracking-widest mb-1">Location</p>
                  <p className="text-sm font-bold text-ivory-warm truncate">{asset.location}</p>
               </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-ivory-warm/5">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => navigate(`/facilities/edit/${asset.id}`)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-ivory-warm/10 text-[10px] font-black text-ivory-warm uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    disabled={deleting === asset.id}
                    className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                  >
                    {deleting === asset.id ? '...' : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                  </button>
                </>
              ) : (
                <button
                  className="w-full py-3 rounded-xl bg-ivory-warm text-plum-dark font-black text-[10px] uppercase tracking-widest hover:bg-blush-soft transition-all opacity-50 cursor-not-allowed"
                  disabled
                >
                  Reserve Soon
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="py-32 text-center luxury-card border-dashed">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
             <span className="text-4xl opacity-20">🏛️</span>
          </div>
          <h3 className="text-xl font-black text-ivory-warm/40 italic tracking-tight">No assets in the registry match your selection</h3>
        </div>
      )}
    </div>
  );
}
