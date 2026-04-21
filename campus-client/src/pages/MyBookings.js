import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyBookings, cancelBooking } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';

const STATUS_STYLES = {
  PENDING: 'bg-amber-50/80 text-amber-600 border-amber-200/50',
  APPROVED: 'bg-emerald-50/80 text-emerald-600 border-emerald-200/50',
  REJECTED: 'bg-rose-50/80 text-rose-600 border-rose-200/50',
  CANCELLED: 'bg-slate-50/80 text-slate-600 border-slate-200/50',
};

/**
 * Helper: formatDT
 * Demonstrates separation of concerns by extracting date formatting logic.
 */

function formatDT(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function MyBookings() {
  /**
   * MyBookings Component
   * Purpose: Provides a student-centric view of all resource reservations.
   * Features: Real-time status tracking, cancellation workflow, and responsive layout.
   */
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, bookingId: null });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings.');
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
      addToast('Booking cancelled successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel booking.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative pb-10"
    >
      {/* Header Section */}
      <div className="bg-[#10B981] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="text-white text-center md:text-left">
          <h1 className="text-2xl font-black mb-1">My Resource Bookings</h1>
          <p className="text-white/80 text-sm font-medium">Track and manage your campus facility reservations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white active:scale-95"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/facilities')}
            className="inline-flex items-center gap-2 bg-white text-[#10B981] px-6 py-2.5 rounded-xl text-sm font-black transition-all hover:bg-gray-50 hover:shadow-lg active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-[#10B981]/20 border-t-[#10B981] rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Loading Bookings...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
          <p className="text-rose-600 font-bold">{error}</p>
          <button onClick={load} className="mt-4 text-[#10B981] font-bold hover:underline">Try Again</button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState 
          title="No Bookings Found" 
          message="You haven't reserved any campus facilities yet. Browse the available spaces to get started."
          onAction={() => navigate('/facilities')}
          actionText="Browse Facilities"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((b) => (
            /* 
               Motion Component: layout prop enables automatic layout animations 
               when items are added, removed, or reordered.
            */
            <motion.div
              layout
              key={b.id}
              className="group bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col md:flex-row items-center gap-6"
            >
              {/* Left: Resource Info */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg tracking-wider">
                    ID: #{b.id.substring(0, 8)}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-800 group-hover:text-[#10B981] transition-colors truncate">
                  {b.resourceName || b.resourceId}
                </h3>
                <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-1 italic">
                  "{b.purpose}"
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#10B981]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Time Slot</p>
                      <p className="text-xs font-bold text-slate-600">{formatDT(b.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-indigo-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Capacity</p>
                      <p className="text-xs font-bold text-slate-600">{b.expectedAttendees} Attendees</p>
                    </div>
                  </div>
                </div>

                {b.status === 'REJECTED' && b.rejectionReason && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-xs font-bold text-rose-600">Rejection reason: {b.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, bookingId: b.id })}
                    disabled={cancelling === b.id}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-black text-xs rounded-xl transition-all border border-rose-100 hover:border-transparent active:scale-95 disabled:opacity-50"
                  >
                    {cancelling === b.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <span>Cancel Booking</span>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">
            {bookings.length} Total Bookings Recorded
          </p>
        </div>
      )}

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, bookingId: null })}
        onConfirm={() => handleCancel(confirmModal.bookingId)}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action will release the resource for others to book."
        confirmText="Cancel Booking"
        type="danger"
      />
    </motion.div>
  );
}
