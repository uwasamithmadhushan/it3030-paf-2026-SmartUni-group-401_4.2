import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllBookings, updateBookingStatus } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  User, 
  Filter, 
  CheckCircle2, 
  XCircle,
  Zap,
  Layers
} from 'lucide-react';

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const STATUS_STYLES = {
  PENDING: 'bg-luna-steel/20 text-luna-cyan border-luna-cyan/20',
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

export default function AdminBookings() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, bookingId: null });

  const load = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllBookings(status || '');
      setBookings(res.data);
    } catch {
      setError('Failed to synchronize global reservation data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(statusFilter); }, [load, statusFilter]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      const res = await updateBookingStatus(id, { status: 'APPROVED' });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...res.data } : b));
      addToast('Reservation successfully authorized', 'success');
    } catch (err) {
      addToast('Authorization failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!reason?.trim()) {
      addToast('Strategic justification is required for rejection', 'error');
      return;
    }
    const id = rejectModal.bookingId;
    setRejectModal({ isOpen: false, bookingId: null });
    setActionLoading(id + '_reject');
    try {
      const res = await updateBookingStatus(id, { status: 'REJECTED', reason });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...res.data } : b));
      addToast('Reservation declined', 'info');
    } catch (err) {
      addToast('Operation failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Accessing Global Schedule..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      <ConfirmationModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, bookingId: null })}
        onConfirm={handleRejectConfirm}
        title="Decline Reservation"
        message="Please provide a strategic justification for declining this resource allocation request."
        confirmText="Decline Now"
        type="danger"
        isInput={true}
      />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Administrative Command</span>
              </div>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter">Booking <span className="text-luna-aqua">Moderation</span></h1>
           <p className="text-text-muted font-medium mt-2">Executive oversight of global campus resource allocation.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 luna-glass p-3 rounded-[2rem]">
          <div className="flex items-center gap-3 px-4">
            <Filter size={14} className="text-luna-aqua" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer appearance-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-luna-midnight text-white">{s || 'All Classifications'}</option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block w-px h-6 bg-luna-aqua/10"></div>
          <button
            onClick={() => load(statusFilter)}
            className="w-10 h-10 flex items-center justify-center bg-luna-aqua/10 text-luna-aqua rounded-xl hover:luna-glow transition-all"
            title="Refresh Registry"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4">
           <Zap className="text-red-400" size={20} />
           <span className="text-sm font-black text-red-400 uppercase tracking-widest">{error}</span>
        </div>
      )}

      {/* Modern Data Grid */}
      <div className="luna-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-luna-steel/5 border-b border-luna-aqua/10 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted">
                <th className="px-10 py-6">Resource & Personnel</th>
                <th className="px-10 py-6">Reservation Objective</th>
                <th className="px-10 py-6">Operational Window</th>
                <th className="px-10 py-6">Current Tier</th>
                <th className="px-10 py-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luna-aqua/5">
              <AnimatePresence>
                {bookings.map((b, idx) => (
                  <motion.tr 
                    key={b.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-luna-aqua/5 transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-lg font-black text-white group-hover:text-luna-aqua transition-colors">{b.resourceName || b.resourceId}</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-luna-cyan uppercase tracking-widest">
                          <User size={12} />
                          {b.username || 'System ID'}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-xs font-medium text-text-muted italic line-clamp-2 max-w-[240px] border-l border-luna-aqua/20 pl-4">"{b.purpose}"</p>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua">
                          <Clock size={18} />
                        </div>
                        <div className="text-[10px] font-black text-white leading-relaxed uppercase tracking-tighter">
                          <div>{formatDT(b.startTime)}</div>
                          <div className="text-text-muted">to {formatDT(b.endTime)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`luna-badge ${STATUS_STYLES[b.status] || 'bg-luna-navy/40 text-text-muted'}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {b.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={!!actionLoading}
                            className="w-10 h-10 rounded-xl bg-luna-aqua/10 text-luna-aqua flex items-center justify-center hover:luna-glow transition-all disabled:opacity-50"
                            title="Authorize"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button
                            onClick={() => setRejectModal({ isOpen: true, bookingId: b.id })}
                            disabled={!!actionLoading}
                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                            title="Decline"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                      {b.status !== 'PENDING' && (
                        <div className="w-10 h-10 rounded-xl bg-luna-steel/5 flex items-center justify-center text-text-muted ml-auto">
                          <ShieldCheck size={18} />
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className="p-8 border-t border-luna-aqua/5 bg-luna-midnight/40 flex justify-between items-center">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{bookings.length} Total Allocation Requests</span>
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-luna-aqua luna-glow animate-pulse"></div>
             <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Real-time Archive</span>
          </div>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="py-40 text-center flex flex-col items-center gap-6 opacity-20">
          <Layers size={64} />
          <h3 className="text-2xl font-black uppercase tracking-widest italic">Moderation queue fully synchronized</h3>
        </div>
      )}
    </div>
  );
}
