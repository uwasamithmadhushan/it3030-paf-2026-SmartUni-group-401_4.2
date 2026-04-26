import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyBookings, cancelBooking, updateBooking } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle,
  Plus,
  RefreshCw,
  ChevronRight,
  Zap,
  Users,
  Globe,
  Pencil,
  Trash2
} from 'lucide-react';

const STATUS_STYLES = {
  PENDING: 'bg-luna-steel/10 text-luna-cyan border-luna-cyan/20',
  APPROVED: 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  CANCELLED: 'bg-luna-navy/40 text-text-muted border-luna-aqua/5',
};

function formatDT(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, bookingId: null });
  const [editModal, setEditModal] = useState({ isOpen: false, booking: null });
  const [editForm, setEditForm] = useState({ startTime: '', endTime: '', purpose: '', expectedAttendees: 1 });
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch {
      setError('Failed to update reservation archive.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: 'CANCELLED' } : b)
      );
      addToast('Reservation successfully revoked', 'success');
    } catch (err) {
      addToast('Revocation failed', 'error');
    } finally {
      setCancelling(null);
      setConfirmModal({ isOpen: false, bookingId: null });
    }
  };

  function toInputValue(iso) {
    const d = new Date(iso);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  }

  const openEditModal = (booking) => {
    setEditForm({
      startTime: toInputValue(booking.startTime),
      endTime: toInputValue(booking.endTime),
      purpose: booking.purpose,
      expectedAttendees: booking.expectedAttendees,
    });
    setEditModal({ isOpen: true, booking });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await updateBooking(editModal.booking.id, {
        resourceId: editModal.booking.resourceId,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        purpose: editForm.purpose,
        expectedAttendees: Number(editForm.expectedAttendees),
      });
      setBookings((prev) => prev.map((b) => b.id === res.data.id ? res.data : b));
      addToast('Reservation updated successfully', 'success');
      setEditModal({ isOpen: false, booking: null });
    } catch (err) {
      addToast(err?.message || err?.response?.data?.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && bookings.length === 0) return <LoadingSpinner fullScreen message="Accessing Reservation Directory..." />;

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
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.2em]">Temporal Access System</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter leading-none">My <span className="text-luna-aqua">Bookings</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl">High-fidelity resource allocation & strategic scheduling intelligence.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={load}
            className="w-14 h-14 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all shadow-xl shadow-luna-aqua/5"
            title="Sync Directory"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/facilities')}
            className="luna-button !px-10 !py-4 shadow-2xl shadow-luna-aqua/20"
          >
            <Plus size={20} /> Initialize Reservation
          </button>
        </motion.div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center gap-6"
        >
           <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
              <Zap size={24} />
           </div>
           <span className="text-base font-black text-red-400 uppercase tracking-widest">{error}</span>
        </motion.div>
      )}

      {/* Reservation Grid */}
      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="popLayout">
          {bookings.map((b, idx) => (
            <motion.div 
              key={b.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="luna-card group flex flex-col xl:flex-row xl:items-center justify-between gap-12 !p-0 overflow-hidden hover:border-luna-aqua/30 transition-all"
            >
              <div className="p-10 flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-4 mb-6">
                  <span className={`luna-badge !px-4 !py-1 ${STATUS_STYLES[b.status] || 'bg-luna-navy/40 text-text-muted'}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  {b.status === 'PENDING' && (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-luna-cyan uppercase tracking-widest">
                      <Clock size={12} className="animate-pulse" />
                      Awaiting Admin Approval
                    </span>
                  )}
                  {b.status === 'REJECTED' && b.rejectionReason && (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-red-400 uppercase tracking-widest">
                      <AlertCircle size={12} />
                      Rejected: {b.rejectionReason}
                    </span>
                  )}
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">RES-#{b.id.substring(0, 12)}</span>
                </div>
                
                <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-luna-aqua transition-colors mb-4 truncate">
                  {b.resourceName || 'Executive Resource'}
                </h3>
                
                <p className="text-lg font-medium text-text-muted italic mb-10 max-w-3xl border-l-2 border-luna-aqua/20 pl-6 leading-relaxed">
                  "{b.purpose}"
                </p>
                
                <div className="flex flex-wrap gap-12 items-center">
                  <IntelligenceMetric icon={<Clock size={20} />} label="Temporal Slot" value={formatDT(b.startTime)} />
                  <div className="w-px h-10 bg-luna-aqua/10 hidden md:block" />
                  <IntelligenceMetric icon={<Users size={20} />} label="Personnel Scale" value={`${b.expectedAttendees} Members`} />
                  <div className="w-px h-10 bg-luna-aqua/10 hidden md:block" />
                  <IntelligenceMetric icon={<MapPin size={20} />} label="Physical Location" value={b.location || 'Central Nexus'} />
                </div>
              </div>

              <div className="p-10 bg-luna-midnight/40 xl:border-l xl:border-luna-aqua/10 flex flex-col sm:flex-row xl:flex-col justify-center gap-6 min-w-[280px]">
                {b.status === 'PENDING' && (
                  <button
                    onClick={() => openEditModal(b)}
                    className="w-full px-8 py-4 bg-luna-aqua/10 text-luna-aqua border border-luna-aqua/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-luna-aqua hover:text-luna-midnight transition-all flex items-center justify-center gap-3"
                  >
                    <Pencil size={16} /> Update
                  </button>
                )}
                <button
                  onClick={() => setConfirmModal({ isOpen: true, bookingId: b.id })}
                  disabled={cancelling === b.id || b.status === 'CANCELLED'}
                  className="w-full px-8 py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-3"
                >
                  <Trash2 size={16} /> {cancelling === b.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {/* Animated Progress Indicator */}
              <div className="absolute bottom-0 left-0 h-1 bg-luna-aqua/5 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: b.status === 'APPROVED' ? '100%' : b.status === 'PENDING' ? '50%' : '5%' }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className={`h-full ${b.status === 'APPROVED' ? 'bg-luna-aqua luna-glow' : 'bg-luna-cyan'}`} 
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {bookings.length === 0 && (
          <div className="py-40 text-center luna-card border-dashed border-luna-aqua/10 flex flex-col items-center gap-8 opacity-20">
            <div className="w-32 h-32 luna-glass rounded-[3rem] flex items-center justify-center text-luna-aqua">
               <Calendar size={64} />
            </div>
            <div>
               <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">No active reservations recorded</h3>
               <p className="text-base font-medium text-text-muted mt-4">Directory archive search yielded zero synchronized entries.</p>
            </div>
            <button onClick={() => navigate('/facilities')} className="luna-button-outline !px-12 !py-4">Initialize Resource Hunt</button>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, bookingId: null })}
        onConfirm={() => handleCancel(confirmModal.bookingId)}
        title="Delete Reservation"
        message="Are you sure you want to delete this reservation? This will cancel it and release the resource back to the pool."
        confirmText="Confirm Delete"
        type="danger"
      />

      {/* Edit / Update Modal */}
      <AnimatePresence>
        {editModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditModal({ isOpen: false, booking: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="luna-card w-full max-w-lg !p-10 space-y-8"
            >
              <h2 className="text-3xl font-black text-white tracking-tighter">Update <span className="text-luna-aqua">Reservation</span></h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                    required
                    className="w-full bg-luna-midnight border border-luna-aqua/20 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-luna-aqua"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">End Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))}
                    required
                    className="w-full bg-luna-midnight border border-luna-aqua/20 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-luna-aqua"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Purpose</label>
                  <textarea
                    value={editForm.purpose}
                    onChange={(e) => setEditForm((f) => ({ ...f, purpose: e.target.value }))}
                    required
                    rows={3}
                    className="w-full bg-luna-midnight border border-luna-aqua/20 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-luna-aqua resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Expected Attendees</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.expectedAttendees}
                    onChange={(e) => setEditForm((f) => ({ ...f, expectedAttendees: e.target.value }))}
                    required
                    className="w-full bg-luna-midnight border border-luna-aqua/20 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-luna-aqua"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModal({ isOpen: false, booking: null })}
                    className="flex-1 px-6 py-3 bg-luna-navy border border-luna-aqua/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 luna-button !py-3 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Status Feed */}
      <div className="flex items-center justify-between pt-12 border-t border-luna-aqua/10 text-[9px] font-black text-text-muted uppercase tracking-[0.5em]">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
            Scheduling Engine Operational
         </div>
         <div className="flex items-center gap-8">
            <span>Archive Sync: Nominal</span>
            <span>Uptime: 1042:18:22</span>
         </div>
      </div>
    </div>
  );
}

const IntelligenceMetric = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 group/metric">
    <div className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua group-hover/metric:luna-glow transition-all">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">{label}</p>
      <p className="text-base font-black text-white group-hover/metric:text-luna-aqua transition-colors">{value}</p>
    </div>
  </div>
);
