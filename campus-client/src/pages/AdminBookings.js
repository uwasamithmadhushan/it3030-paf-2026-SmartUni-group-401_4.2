import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getAllBookings, updateBookingStatus } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const STATUS_STYLES = {
  PENDING: 'bg-amber-50/80 text-amber-600 border-amber-200/50',
  APPROVED: 'bg-emerald-50/80 text-emerald-600 border-emerald-200/50',
  REJECTED: 'bg-rose-50/80 text-rose-600 border-rose-200/50',
  CANCELLED: 'bg-slate-50/80 text-slate-600 border-slate-200/50',
};

function formatDT(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Removed custom RejectModal in favor of reusable ConfirmationModal

export default function AdminBookings() {
  /**
   * AdminBookings Component
   * Purpose: Administrative moderation dashboard for campus resource reservations.
   * Logic: Fetches all bookings (optionally filtered by status) and provides approval/rejection workflows.
   */
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, bookingId: null });

  /**
   * Load Bookings (Side Effect)
   * Fetches data based on the selected status filter.
   * Wrapped in useCallback to prevent unnecessary re-renders.
   */
  const load = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllBookings(status || '');
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings.');
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
      addToast('Booking approved successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to approve booking.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    // Defensive Programming: Ensuring mandatory data is present before API call
    if (!reason?.trim()) {
      addToast('Rejection reason is required', 'error');
      return;
    }
    const id = rejectModal.bookingId;
    setRejectModal({ isOpen: false, bookingId: null });
    setActionLoading(id + '_reject');
    try {
      const res = await updateBookingStatus(id, { status: 'REJECTED', reason });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...res.data } : b));
      addToast('Booking rejected', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject booking.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative pb-10"
    >
      <ConfirmationModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, bookingId: null })}
        onConfirm={handleRejectConfirm}
        title="Reject Booking"
        message="Please provide a reason for rejecting this booking request."
        confirmText="Reject Booking"
        type="danger"
        isInput={true}
      />

      {/* Header Section */}
      <div className="bg-[#10B981] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="text-white text-center md:text-left">
          <h1 className="text-2xl font-black mb-1">Booking Management</h1>
          <p className="text-white/80 text-sm font-medium">Review and moderate all campus resource requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2 px-3">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Show:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="text-slate-800">{s || 'All Requests'}</option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block w-px h-6 bg-white/20"></div>
          <button
            onClick={() => load(statusFilter)}
            className="w-10 h-10 flex items-center justify-center bg-white text-[#10B981] rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-[#10B981]/20 border-t-[#10B981] rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Requests...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
          <p className="text-rose-600 font-bold">{error}</p>
          <button onClick={() => load(statusFilter)} className="mt-4 text-[#10B981] font-bold hover:underline">Try Again</button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState 
          title="Clear Dashboard" 
          message="There are no booking requests matching the current filter."
          onAction={() => setStatusFilter('')}
          actionText="View All Bookings"
        />
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100/80 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-widest font-black text-slate-400">
                  <th className="px-8 py-5">Resource & User</th>
                  <th className="px-8 py-5">Purpose</th>
                  <th className="px-8 py-5">Schedule</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* 
                   Dynamic Row Generation: Iterating through bookings array 
                   to render table rows with unique keys and conditional logic.
                */}
                {bookings.map((b) => (
                  <tr key={b.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-black text-slate-800">{b.resourceName || b.resourceId}</span>
                        <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
                          {b.username || b.userId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-500 font-medium italic line-clamp-2 max-w-[200px]">"{b.purpose}"</p>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-1 block">
                        {b.expectedAttendees} Attendees Expected
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-600 leading-tight">
                          <div>{formatDT(b.startTime)}</div>
                          <div className="text-slate-400">to {formatDT(b.endTime)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {b.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-black text-xs rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                          >
                            {actionLoading === b.id + '_approve' ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectModal({ isOpen: true, bookingId: b.id })}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-black text-xs rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{bookings.length} Total Requests</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
