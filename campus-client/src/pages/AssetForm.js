import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssetById, createAsset, updateAsset } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  Globe,
  Sparkles,
  Activity
} from 'lucide-react';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'INACTIVE'];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Research Lab',
  MEETING_ROOM: 'Executive Suite',
  EQUIPMENT: 'Precision Equipment',
};

const EMPTY_FORM = {
  resourceCode: '',
  resourceName: '',
  resourceType: '',
  capacity: '',
  building: '',
  floor: '',
  roomNumber: '',
  description: '',
  availableFrom: '08:00',
  availableTo: '18:00',
  status: 'ACTIVE',
};

export default function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loadingAsset, setLoadingAsset] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    const fetchAsset = async () => {
      try {
        const res = await getAssetById(id);
        const asset = res.data;
        setForm({
          resourceCode: asset.resourceCode || '',
          resourceName: asset.resourceName || '',
          resourceType: asset.resourceType || '',
          capacity: asset.capacity || '',
          building: asset.building || '',
          floor: asset.floor || '',
          roomNumber: asset.roomNumber || '',
          description: asset.description || '',
          availableFrom: asset.availableFrom || '08:00',
          availableTo: asset.availableTo || '18:00',
          status: asset.status || 'ACTIVE',
        });
      } catch (err) {
        setApiError('Failed to load resource.');
      } finally {
        setLoadingAsset(false);
      }
    };
    fetchAsset();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      if (isEdit) {
        await updateAsset(id, payload);
        showToast('Facility updated successfully.', 'success');
      } else {
        await createAsset(payload);
        showToast('Facility created successfully.', 'success');
      }
      navigate('/facilities');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save facility.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAsset) return <LoadingSpinner fullScreen message="Accessing Blueprint Archive..." />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
      
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/facilities')} 
            className="w-16 h-16 luna-glass rounded-3xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Globe size={12} className="text-luna-aqua animate-pulse" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Infrastructure Registry</span>
              </div>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
              {isEdit ? 'Refine' : 'Deploy'} <span className="text-luna-aqua">Asset</span>
            </h1>
            <p className="text-text-muted font-medium mt-3 text-lg">{isEdit ? 'High-fidelity modification of campus infrastructure.' : 'Initializing state-of-the-art facility intelligence.'}</p>
          </motion.div>
        </div>
        <Sparkles size={32} className="text-luna-aqua/20 hidden lg:block" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Core Configuration Suite */}
        <div className="xl:col-span-8">
          <form onSubmit={handleSubmit} className="luna-card !p-12 space-y-12">
            
            <AnimatePresence mode="wait">
              {apiError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center gap-6"
                >
                   <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                      <Zap size={24} />
                   </div>
                   <span className="text-base font-black text-red-400 uppercase tracking-widest">{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="group">
                  <label className="luna-label !ml-2">Resource Code</label>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input
                      type="text"
                      name="resourceCode"
                      value={form.resourceCode}
                      onChange={handleChange}
                      placeholder="Ex: LH-A101"
                      className="luna-input !pl-16 !py-5"
                      required
                    />
                  </div>
               </div>
               <div className="group">
                  <label className="luna-label !ml-2">Resource Name</label>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input
                      type="text"
                      name="resourceName"
                      value={form.resourceName}
                      onChange={handleChange}
                      placeholder="Ex: Main Auditorium A1"
                      className="luna-input !pl-16 !py-5"
                      required
                    />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="group">
                  <label className="luna-label !ml-2">Resource Type</label>
                  <div className="relative">
                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <select name="resourceType" value={form.resourceType} onChange={handleChange} className="luna-input !pl-16 !py-5 appearance-none cursor-pointer" required>
                      <option value="" className="bg-luna-midnight">Select Type...</option>
                      {RESOURCE_TYPES.map(t => <option key={t} value={t} className="bg-luna-midnight text-white">{TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
               </div>
               <div className="group">
                  <label className="luna-label !ml-2">Capacity</label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="Person count" className="luna-input !pl-16 !py-5" required min="0" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="group">
                  <label className="luna-label !ml-2">Building</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input type="text" name="building" value={form.building} onChange={handleChange} placeholder="Building name" className="luna-input !pl-16 !py-5" required />
                  </div>
               </div>
               <div className="group">
                  <label className="luna-label !ml-2">Floor</label>
                  <div className="relative">
                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input type="text" name="floor" value={form.floor} onChange={handleChange} placeholder="Ex: Ground, 1st" className="luna-input !pl-16 !py-5" required />
                  </div>
               </div>
               <div className="group">
                  <label className="luna-label !ml-2">Room Number</label>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input type="text" name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="Ex: 101" className="luna-input !pl-16 !py-5" required />
                  </div>
               </div>
            </div>

            <div className="group">
               <label className="luna-label !ml-2">Description</label>
               <textarea name="description" value={form.description} onChange={handleChange} placeholder="Optional description..." className="luna-input !py-4 resize-none" rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="group">
                  <label className="luna-label !ml-2">Available From</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input type="time" name="availableFrom" value={form.availableFrom} onChange={handleChange} className="luna-input !pl-16 !py-5" required />
                  </div>
               </div>
               <div className="group">
                  <label className="luna-label !ml-2">Available To</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <input type="time" name="availableTo" value={form.availableTo} onChange={handleChange} className="luna-input !pl-16 !py-5" required />
                  </div>
               </div>
               <div className="group">
                  <label className="luna-label !ml-2">Status</label>
                  <div className="relative">
                    <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                    <select name="status" value={form.status} onChange={handleChange} className="luna-input !pl-16 !py-5 appearance-none cursor-pointer" required>
                      {RESOURCE_STATUSES.map(s => <option key={s} value={s} className="bg-luna-midnight text-white">{s}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-end gap-10 pt-12 border-t border-luna-aqua/5">
              <button 
                type="button" 
                onClick={() => navigate('/facilities')} 
                className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="luna-button !px-16 !py-5 shadow-2xl shadow-luna-aqua/20"
              >
                {submitting ? 'Saving...' : (
                  <span className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em]">
                    {isEdit ? 'Save Changes' : 'Add Facility'} <ChevronRight size={20} />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Intelligence */}
        <div className="xl:col-span-4 space-y-12">
          <div className="luna-card !p-10 border-luna-aqua/5 group overflow-hidden relative">
             <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <ShieldCheck size={160} />
             </div>
             <h3 className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
               Operational Integrity <ShieldCheck size={14} />
             </h3>
             <p className="text-sm font-medium text-text-muted leading-relaxed mb-12 opacity-80">
               Infrastructure nodes are synchronized across the global matrix. Classification accuracy is paramount for strategic resource allocation.
             </p>
             <div className="space-y-6">
                <NodeStatus icon={<Globe size={16} />} label="Global Registry Sync" />
                <NodeStatus icon={<Activity size={16} />} label="Instant Matrix Push" />
                <NodeStatus icon={<ShieldCheck size={16} />} label="RBAC Policy Enforced" />
             </div>
          </div>

          <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/5 !p-10">
             <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8">Node Diagnostics</h3>
             <div className="p-6 rounded-3xl bg-luna-midnight/60 border border-luna-aqua/10 text-center">
                <p className="text-5xl font-black text-luna-aqua tracking-tighter mb-2 animate-pulse">99.9%</p>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">System Loyalty Index</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const NodeStatus = ({ icon, label }) => (
  <div className="flex items-center gap-4 p-5 rounded-2xl bg-luna-midnight/40 border border-luna-aqua/5 group/node hover:border-luna-aqua/20 transition-all">
     <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua group-hover/node:luna-glow transition-all">
        {icon}
     </div>
     <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
  </div>
);
