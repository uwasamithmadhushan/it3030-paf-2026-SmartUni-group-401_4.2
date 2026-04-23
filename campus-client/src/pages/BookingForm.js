import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAssetById, createBooking } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Users,
  ChevronRight,
  Zap,
  Layers,
  MapPin,
  Sparkles,
  ShieldCheck,
  Globe,
  Send,
  Activity
} from 'lucide-react';

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Research Lab',
  MEETING_ROOM: 'Executive Suite',
  EQUIPMENT: 'Precision Equipment',
};

// Format a Date to "YYYY-MM-DDTHH:mm" for datetime-local input
function toInputValue(date) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

// Returns now + offsetMinutes as an input-ready string
function nowPlus(offsetMinutes) {
  return toInputValue(Date.now() + offsetMinutes * 60 * 1000);
}

export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resourceId = searchParams.get('resourceId');

  const [resource, setResource] = useState(null);
  const [loadingResource, setLoadingResource] = useState(true);
  const [resourceError, setResourceError] = useState('');

  const defaultStart = nowPlus(60);
  const defaultEnd = nowPlus(120);

  const [form, setForm] = useState({
    resourceId: resourceId || '',
    startTime: defaultStart,
    endTime: defaultEnd,
    purpose: '',
    expectedAttendees: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resourceId) {
      setLoadingResource(false);
      return;
    }
    const fetchResource = async () => {
      try {
        const res = await getAssetById(resourceId);
        setResource(res.data);
      } catch (err) {
        setResourceError('Resource synchronization failure.');
      } finally {
        setLoadingResource(false);
      }
    };
    fetchResource();
  }, [resourceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'expectedAttendees' ? Number(value) : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);

    if (end <= start) {
      setError('Temporal termination must follow commencement.');
      return;
    }
    if (start <= new Date()) {
      setError('Reservations must be scheduled for future windows.');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        resourceId: form.resourceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees,
      });
      navigate('/my-bookings');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Resource synchronization conflict.';
      setError(typeof msg === 'string' ? msg : 'Matrix availability collision detected.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingResource) return <LoadingSpinner fullScreen message="Accessing Availability Archive..." />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
      
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate(-1)} 
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
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Temporal Allocation Hub</span>
              </div>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
              Initialize <span className="text-luna-aqua">Reservation</span>
            </h1>
            <p className="text-text-muted font-medium mt-3 text-lg">Configuring state-of-the-art temporal access requests.</p>
          </motion.div>
        </div>
        <Activity size={32} className="text-luna-aqua/20 hidden lg:block" />
      </div>

      {/* Resource Context Intelligence */}
      <AnimatePresence>
        {resource && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="luna-card !bg-luna-midnight/60 border-luna-aqua/10 flex flex-col md:flex-row items-center gap-10 !p-10 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 p-8 opacity-[0.03]">
               <Building2 size={160} />
            </div>
            <div className="w-24 h-24 rounded-[2.5rem] bg-luna-aqua/10 border border-luna-aqua/20 flex items-center justify-center text-5xl luna-glow shadow-2xl shadow-luna-aqua/20 relative z-10">
              🏛️
            </div>
            <div className="relative z-10 flex-1 text-center md:text-left">
              <h3 className="text-3xl font-black text-white tracking-tighter">{resource.name}</h3>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 mt-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-luna-cyan uppercase tracking-widest">
                    <Layers size={14} className="text-luna-aqua" /> {TYPE_LABELS[resource.type] || resource.type}
                 </div>
                 <div className="w-1 h-1 rounded-full bg-white/20" />
                 <div className="flex items-center gap-2 text-[10px] font-black text-luna-cyan uppercase tracking-widest">
                    <MapPin size={14} className="text-luna-aqua" /> {resource.location}
                 </div>
                 <div className="w-1 h-1 rounded-full bg-white/20" />
                 <div className="flex items-center gap-2 text-[10px] font-black text-luna-cyan uppercase tracking-widest">
                    <Users size={14} className="text-luna-aqua" /> {resource.capacity} Pers. Capacity
                 </div>
              </div>
            </div>
            <ShieldCheck size={40} className="text-luna-aqua/20 hidden xl:block" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Reservation Specification Suite */}
        <div className="xl:col-span-8">
          <form onSubmit={handleSubmit} className="luna-card !p-12 space-y-12">
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center gap-6"
                >
                   <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                      <AlertCircle size={24} />
                   </div>
                   <span className="text-base font-black text-red-400 uppercase tracking-widest leading-none">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!resourceId && (
              <div className="group">
                <label className="luna-label !ml-2">Target Resource Identifier</label>
                <div className="relative">
                  <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                  <input
                    name="resourceId"
                    value={form.resourceId}
                    onChange={handleChange}
                    required
                    placeholder="Enter strategic resource identifier..."
                    className="luna-input !pl-16 !py-5"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <label className="luna-label !ml-2">Temporal Commencement</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                    className="luna-input !pl-16 !py-5 appearance-none"
                  />
                </div>
              </div>
              <div className="group">
                <label className="luna-label !ml-2">Temporal Termination</label>
                <div className="relative">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                    className="luna-input !pl-16 !py-5 appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="luna-label !ml-2">Personnel Intensity</label>
              <div className="relative">
                <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                <input
                  type="number"
                  name="expectedAttendees"
                  value={form.expectedAttendees}
                  onChange={handleChange}
                  min="1"
                  max={resource?.capacity || undefined}
                  required
                  placeholder="Expected member count..."
                  className="luna-input !pl-16 !py-5"
                />
                {resource?.capacity && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                     <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Limit: {resource.capacity}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="group">
              <label className="luna-label !ml-2">Mission Objective Narrative</label>
              <div className="relative">
                <Zap className="absolute left-6 top-6 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Specify the strategic purpose of this temporal resource allocation..."
                  className="luna-input !pl-16 !p-6 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-10 pt-12 border-t border-luna-aqua/5">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] hover:text-white transition-all"
              >
                Abort Protocol
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="luna-button !px-16 !py-5 shadow-2xl shadow-luna-aqua/20 group/btn"
              >
                {submitting ? 'Transmitting Request...' : (
                  <span className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em]">
                    Confirm Reservation <Send size={20} className="group-hover/btn:translate-x-3 transition-transform" />
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
                Access Policy <Sparkles size={14} />
              </h3>
              <p className="text-sm font-medium text-text-muted leading-relaxed mb-12 opacity-80">
                All reservations are subject to executive audit and matrix availability synchronization. Verified identity is mandatory.
              </p>
              <div className="space-y-6">
                 <PolicyMetric icon={<ShieldCheck size={16} />} label="Identity Verification" />
                 <PolicyMetric icon={<Globe size={16} />} label="Global Matrix Check" />
                 <PolicyMetric icon={<Zap size={16} />} label="Instant Sync Hub" />
              </div>
           </div>

           <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/5 !p-10 text-center">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 text-left">Allocation Load</h3>
              <div className="p-8 rounded-[2.5rem] bg-luna-midnight/60 border border-luna-aqua/10">
                 <p className="text-5xl font-black text-luna-aqua tracking-tighter mb-2 animate-pulse">84%</p>
                 <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Temporal Slot Density</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const PolicyMetric = ({ icon, label }) => (
  <div className="flex items-center gap-4 p-5 rounded-2xl bg-luna-midnight/40 border border-luna-aqua/5 group/node hover:border-luna-aqua/20 transition-all">
     <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua group-hover/node:luna-glow transition-all">
        {icon}
     </div>
     <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
  </div>
);
