import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAssets, deleteAsset } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  Trash2, 
  Edit3, 
  Layers,
  Globe,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

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
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const [filters, setFilters] = useState({ type: '', minCapacity: '', building: '' });

  const fetchAssets = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllAssets(params);
      setAssets(res.data?.content ?? res.data);
    } catch {
      setError('Failed to synchronize facility portfolio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets({ status: 'ACTIVE' });
  }, [fetchAssets]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyFilter = () => {
    const params = { status: 'ACTIVE' };
    if (filters.type) params.type = filters.type;
    if (filters.minCapacity) params.minCapacity = filters.minCapacity;
    if (filters.building) params.building = filters.building;
    fetchAssets(params);
  };

  const handleClearFilter = () => {
    const empty = { type: '', minCapacity: '', building: '' };
    setFilters(empty);
    fetchAssets({ status: 'ACTIVE' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Decommission this facility resource?')) return;
    setDeleting(id);
    try {
      await deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      showToast('Facility resource decommissioned.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Decommissioning failed.';
      showToast(msg, 'error');
    } finally {
      setDeleting(null);
    }
  };

  if (loading && assets.length === 0) return <LoadingSpinner fullScreen message="Scanning Infrastructure Matrix..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Globe size={12} className="text-luna-aqua animate-pulse" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.2em]">Global Asset Registry</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Facility <span className="text-luna-aqua">Portfolio</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl">High-fidelity infrastructure oversight and strategic resource allocation.</p>
        </motion.div>
        
        {isAdmin && (
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/facilities/add')} 
            className="luna-button !px-10 !py-4 shadow-2xl shadow-luna-aqua/20"
          >
            <Plus size={20} /> Register New Asset
          </motion.button>
        )}
      </div>

      {/* Advanced Filter Matrix */}
      <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/5 !p-10">
        <div className="flex flex-col xl:flex-row gap-10 items-end">
          <div className="flex-1 min-w-[280px] group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Resource Classification</label>
            <div className="relative">
              <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
              >
                <option value="">Global Search Classification...</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-luna-midnight text-white">{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full xl:w-60 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Minimum Capacity</label>
            <div className="relative">
               <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
               <input
                 type="number"
                 name="minCapacity"
                 value={filters.minCapacity}
                 onChange={handleFilterChange}
                 placeholder="Pers. Count"
                 className="luna-input !pl-16 !py-4"
               />
            </div>
          </div>

          <div className="flex-1 min-w-[280px] group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Physical Hub</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <input
                type="text"
                name="building"
                value={filters.building}
                onChange={handleFilterChange}
                placeholder="Building / Wing..."
                className="luna-input !pl-16 !py-4"
              />
            </div>
          </div>

          <div className="flex gap-4 w-full xl:w-auto">
            <button onClick={handleApplyFilter} className="luna-button !px-12 !py-4 shadow-xl shadow-luna-aqua/10 flex items-center gap-3">
               <Search size={18} /> Execute Scan
            </button>
            <button onClick={handleClearFilter} className="luna-button-outline !px-8 !py-4">
               Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-6"
        >
           <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
              <ShieldAlert size={24} />
           </div>
           <span className="text-base font-black text-red-400 uppercase tracking-widest leading-none">{error}</span>
        </motion.div>
      )}

      {/* Asset Infrastructure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {assets.map((asset, idx) => (
            <motion.div 
              key={asset.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="luna-card group hover:border-luna-aqua/30 flex flex-col relative overflow-hidden !p-0"
            >
              {/* Asset Header Background */}
              <div className="h-40 bg-luna-midnight/60 relative overflow-hidden border-b border-luna-aqua/5">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-luna-midnight to-transparent" />
                 <div className="absolute top-8 left-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-luna-midnight/80 border border-luna-aqua/10 flex items-center justify-center text-4xl group-hover:luna-glow group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-luna-aqua/10">
                       {asset.resourceType === 'LECTURE_HALL' ? '🏛️' : asset.resourceType === 'LAB' ? '🧪' : asset.resourceType === 'MEETING_ROOM' ? '💼' : '🛠️'}
                    </div>
                    <div>
                       <span className={`luna-badge !px-3 !py-1 ${asset.status === 'ACTIVE' ? 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {asset.status}
                       </span>
                    </div>
                 </div>
                 <Sparkles size={24} className="absolute right-8 top-8 text-luna-aqua/10 group-hover:text-luna-aqua/30 transition-colors" />
              </div>

              <div className="p-10 flex-1 flex flex-col">
                <h3 className="text-3xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tighter mb-2">{asset.resourceName}</h3>
                <p className="text-[10px] font-black text-luna-cyan uppercase tracking-[0.4em] mb-10">{TYPE_LABELS[asset.resourceType] || asset.resourceType}</p>

                <div className="grid grid-cols-2 gap-6 mb-12">
                   <div className="p-5 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5 group/metric hover:border-luna-aqua/20 transition-all">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 group-hover/metric:text-white transition-colors">Max Volume</p>
                      <p className="text-lg font-black text-white flex items-center gap-3"><Users size={16} className="text-luna-aqua" /> {asset.capacity}</p>
                   </div>
                   <div className="p-5 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5 group/metric hover:border-luna-aqua/20 transition-all">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 group-hover/metric:text-white transition-colors">Building</p>
                      <p className="text-lg font-black text-white truncate flex items-center gap-3"><MapPin size={16} className="text-luna-aqua" /> {asset.building}</p>
                   </div>
                </div>

                <div className="mt-auto flex gap-4 pt-10 border-t border-luna-aqua/5">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => navigate(`/facilities/edit/${asset.id}`)}
                        className="flex-1 luna-button-outline !py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] group/edit"
                      >
                        Refine <Edit3 size={16} className="group-hover/edit:rotate-12 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        disabled={deleting === asset.id}
                        className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-lg hover:shadow-red-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  ) : user?.role === 'USER' ? (
                    <button
                      onClick={() => navigate(`/bookings/new?resourceId=${asset.id}`)}
                      className="w-full luna-button !py-4 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] group/res"
                    >
                      Reserve <ArrowRight size={20} className="group-hover/res:translate-x-2 transition-transform" />
                    </button>
                  ) : null}
                </div>
              </div>
              
              {/* Animated Progress Accent */}
              <div className="absolute bottom-0 left-0 h-1 bg-luna-aqua/5 w-full">
                <div className={`h-full bg-luna-aqua ${asset.status === 'AVAILABLE' ? 'w-full luna-glow' : 'w-1/4 opacity-20'}`} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {assets.length === 0 && (
        <div className="py-48 text-center luna-card border-dashed border-luna-aqua/10 flex flex-col items-center gap-10 opacity-20">
          <div className="w-32 h-32 luna-glass rounded-[3rem] flex items-center justify-center text-luna-aqua">
             <Building2 size={64} />
          </div>
          <div>
             <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">Portfolio Registry Empty</h3>
             <p className="text-base font-medium text-text-muted mt-4">Current synchronization parameters returned zero infrastructure assets.</p>
          </div>
          <button onClick={handleClearFilter} className="luna-button-outline !px-12 !py-4">Reset Archive Filter</button>
        </div>
      )}

      {/* Superior Status Footer */}
      <div className="flex items-center justify-between pt-12 border-t border-luna-aqua/10 text-[9px] font-black text-text-muted uppercase tracking-[0.5em]">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
            Portfolio Matrix Synchronized
         </div>
         <div className="flex items-center gap-8">
            <span>Scan Depth: Global</span>
            <span>Uptime: 2120:04:12</span>
         </div>
      </div>
    </div>
  );
}
