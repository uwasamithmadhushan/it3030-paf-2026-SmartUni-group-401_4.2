import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/api';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-50  text-green-700  border-green-200',
  REJECTED: 'bg-red-50    text-red-700    border-red-200',
  CANCELLED: 'bg-gray-100  text-gray-500   border-gray-200',
};

function formatDT(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

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
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: 'CANCELLED' } : b)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage your resource reservations</p>
        </div>
        <button
          onClick={() => navigate('/facilities')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow"
        >
          + New Booking
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm gap-3">
          <span className="text-4xl">📅</span>
          <p>No bookings found.</p>
          <button
            onClick={() => navigate('/facilities')}
            className="mt-2 text-sm text-indigo-600 hover:underline"
          >
            Browse facilities to book one
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              {/* Status pill */}
              <div className="shrink-0 flex items-start sm:pt-0.5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {b.status}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{b.resourceName || b.resourceId}</p>
                <p className="text-sm text-gray-500 mt-0.5">{b.purpose}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span>🕐 {formatDT(b.startTime)} → {formatDT(b.endTime)}</span>
                  <span>👥 {b.expectedAttendees} attendee{b.expectedAttendees !== 1 ? 's' : ''}</span>
                </div>
                {b.status === 'REJECTED' && b.rejectionReason && (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
                    Rejection reason: {b.rejectionReason}
                  </p>
                )}
              </div>

              {/* Actions */}
              {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                <div className="shrink-0">
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <p className="text-xs text-gray-400 text-right">{bookings.length} booking(s)</p>
      )}
    </div>
  );
}
