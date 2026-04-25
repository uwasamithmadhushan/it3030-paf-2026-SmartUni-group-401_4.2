import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllResources, deleteResource } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Users, 
  Trash2, 
  Edit3, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Layers,
  Globe,
  Activity,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Clock
} from 'lucide-react';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Research Lab',
  MEETING_ROOM: 'Executive Suite',
  EQUIPMENT: 'Precision Equipment',
};

const STATUS_STYLES = {
  ACTIVE: 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20',
  OUT_OF_SERVICE: 'bg-red-500/10 text-red-400 border-red-500/20',
  MAINTENANCE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  INACTIVE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function ResourceListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  const [filters, setFilters] = useState({ 
    keyword: '', 
    type: '', 
    building: '', 
    minCapacity: '',
    status: 'ACTIVE' 
  });

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllResources({ ...filters, page: 0, size: 100 });
      setResources(res.data.content);
    } catch (err) {
      setError('System failure: Unable to update resource system.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    setDeleting(id);
    try {
      await deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete the resource.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading && resources.length === 0) return <LoadingSpinner fullScreen message="Accessing Resource Grid..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      
      {/* Dynamic Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.2em]">Facilities Management</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Resource <span className="text-luna-aqua">Catalogue</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl italic opacity-80">Managing high-density campus assets and strategic infrastructure.</p>
        </motion.div>
        
        {isAdmin && (
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/admin/resources/new')} 
            className="luna-button !px-10 !py-4 shadow-2xl shadow-luna-aqua/20 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
            Register New Resource
          </motion.button>
        )}
      </div>

      {/* Neural Filter Interface */}
      <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/5 !p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 items-end">
          
          <div className="group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Search</label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Code, Name, Description..."
                className="luna-input !pl-16 !py-4"
              />
            </div>
          </div>

          <div className="group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Type</label>
            <div className="relative">
              <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="luna-input !pl-16 !py-4 appearance-none"
              >
                <option value="">All Types</option>
                {RESOURCE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>

          <div className="group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Building</label>
            <div className="relative">
              <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <input
                type="text"
                name="building"
                value={filters.building}
                onChange={handleFilterChange}
                placeholder="Building Name..."
                className="luna-input !pl-16 !py-4"
              />
            </div>
          </div>

          <div className="group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Minimum Capacity</label>
            <div className="relative">
              <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <input
                type="number"
                name="minCapacity"
                value={filters.minCapacity}
                onChange={handleFilterChange}
                placeholder="Persons..."
                className="luna-input !pl-16 !py-4"
              />
            </div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setFilters({ keyword: '', type: '', building: '', minCapacity: '', status: 'ACTIVE' })} className="luna-button-outline w-full !py-4">
               Clear Filters
             </button>
          </div>

        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-6"
        >
           <ShieldAlert size={24} className="text-red-400" />
           <span className="text-sm font-black text-red-400 uppercase tracking-widest">{error}</span>
        </motion.div>
      )}

      {/* High-Fidelity Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {resources.map((res, idx) => (
            <motion.div 
              key={res.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="luna-card group hover:border-luna-aqua/30 flex flex-col relative overflow-hidden !p-0"
            >
              <div className="h-32 bg-luna-midnight/60 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-luna-midnight to-transparent" />
                 <div className="absolute top-6 left-8 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-luna-midnight/80 border border-luna-aqua/10 flex items-center justify-center text-3xl shadow-xl">
                       {res.resourceType === 'LECTURE_HALL' ? '🏛️' : res.resourceType === 'LAB' ? '🧪' : res.resourceType === 'MEETING_ROOM' ? '💼' : '🛠️'}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.2em] mb-1">{res.resourceCode}</p>
                       <span className={`luna-badge !px-3 !py-1 text-[9px] ${STATUS_STYLES[res.status]}`}>
                          {res.status.replace('_', ' ')}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="p-8 pt-2 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tighter mb-1 truncate">{res.resourceName}</h3>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em] mb-8">{TYPE_LABELS[res.resourceType]}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 rounded-2xl bg-luna-midnight/40 border border-luna-aqua/5 flex items-center gap-4 group/item hover:border-luna-aqua/20 transition-all">
                      <Users size={16} className="text-luna-aqua" />
                      <div>
                        <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Capacity</p>
                        <p className="text-sm font-black text-white">{res.capacity} People</p>
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-luna-midnight/40 border border-luna-aqua/5 flex items-center gap-4 group/item hover:border-luna-aqua/20 transition-all">
                      <MapPin size={16} className="text-luna-aqua" />
                      <div>
                        <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Location</p>
                        <p className="text-sm font-black text-white truncate">{res.building}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3 text-text-muted mb-8 px-2">
                   <Clock size={14} className="text-luna-aqua/50" />
                   <span className="text-[10px] font-bold tracking-wider">Available: {res.availableFrom} — {res.availableTo}</span>
                </div>

                <div className="mt-auto flex gap-3 pt-6 border-t border-luna-aqua/5">
                   <button 
                     onClick={() => navigate(`/resources/${res.id}`)}
                     className="flex-1 luna-button-outline !py-3 !text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 group/btn"
                   >
                     View Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                   
                   {isAdmin && (
                     <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/admin/resources/edit/${res.id}`)}
                          className="w-10 h-10 rounded-xl bg-luna-aqua/5 border border-luna-aqua/10 text-luna-aqua flex items-center justify-center hover:bg-luna-aqua hover:text-white transition-all shadow-lg hover:shadow-luna-aqua/20"
                        >
                           <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(res.id)}
                          disabled={deleting === res.id}
                          className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {resources.length === 0 && !loading && (
        <div className="py-40 text-center luna-card border-dashed border-luna-aqua/10 opacity-30">
           <Building2 size={64} className="mx-auto text-luna-aqua mb-8" />
           <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">No Resources Found</h3>
           <p className="text-base text-text-muted mt-2">No infrastructure resources match current search parameters.</p>
        </div>
      )}

      {/* Command Status Footer */}
      <div className="flex items-center justify-between pt-10 border-t border-luna-aqua/10 text-[9px] font-black text-text-muted uppercase tracking-[0.5em]">
         <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-luna-aqua animate-pulse" />
            Last Updated: {new Date().toLocaleTimeString()}
         </div>
         <div>SmartUni Operations Hub v4.2</div>
      </div>

    </div>
  );
}
