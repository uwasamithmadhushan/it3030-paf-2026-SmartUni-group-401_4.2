import { useEffect, useState, useCallback } from 'react';
import { getAllBookings, updateBookingStatus } from '../services/api';

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const STATUS_STYLES = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED:  'bg-green-50  text-green-700  border-green-200',
  REJECTED:  'bg-red-50    text-red-700    border-red-200',
  CANCELLED: 'bg-gray-100  text-gray-500   border-gray-200',
};

function formatDT(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Reject Booking</h3>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Rejection Reason <span className="text-red-500">*</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Explain why this booking is rejected…"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            Confirm Reject
          </button>
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // booking id to reject

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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    const id = rejectTarget;
    setRejectTarget(null);
    setActionLoading(id + '_reject');
    try {
      const res = await updateBookingStatus(id, { status: 'REJECTED', reason });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...res.data } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      {rejectTarget && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="p-8 max-w-[1400px] mx-auto space-y-8">
        {/* Redesigned Admin Header */}
        <div className="bg-[#10B981] rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-500/10">
          <div className="text-white text-center lg:text-left">
            <h1 className="text-2xl font-black mb-1 tracking-tight">Booking Management</h1>
            <p className="text-emerald-50 text-sm font-medium opacity-90">Review and action all campus resource requests.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Status Filter Styled */}
            <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70 ml-3">Filter</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white text-[#10B981] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-white/50 cursor-pointer shadow-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s || 'All Statuses'}</option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => load(statusFilter)}
              className="w-11 h-11 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-2xl transition-all text-white shadow-sm active:scale-95"
              title="Refresh Data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <span className="text-4xl">📋</span>
            No bookings found for this filter.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Resource', 'User', 'Purpose', 'Time Window', 'Attendees', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-800 max-w-[140px] truncate">
                      {b.resourceName || b.resourceId}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{b.username || b.userId}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-[160px] truncate" title={b.purpose}>
                      {b.purpose}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      <div>{formatDT(b.startTime)}</div>
                      <div className="text-gray-400">→ {formatDT(b.endTime)}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-center">{b.expectedAttendees}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {b.status}
                      </span>
                      {b.status === 'REJECTED' && b.rejectionReason && (
                        <p className="mt-1 text-xs text-red-500 max-w-[120px] truncate" title={b.rejectionReason}>
                          {b.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {b.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={!!actionLoading}
                            className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {actionLoading === b.id + '_approve' ? '…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectTarget(b.id)}
                            disabled={!!actionLoading}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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
        )}

        {!loading && !error && (
          <p className="text-xs text-gray-400 text-right">{bookings.length} record(s)</p>
        )}
      </div>
    </>
  );
}
