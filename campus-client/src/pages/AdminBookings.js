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

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
            <p className="text-sm text-gray-500 mt-1">Review and action all booking requests</p>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All Statuses'}</option>
              ))}
            </select>
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
