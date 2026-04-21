import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAssetById, createBooking } from '../services/api';

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
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
    getAssetById(resourceId)
      .then((res) => setResource(res.data))
      .catch(() => setResourceError('Could not load resource details.'))
      .finally(() => setLoadingResource(false));
  }, [resourceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'expectedAttendees' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);

    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }
    if (start <= new Date()) {
      setError('Start time must be in the future.');
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
      navigate('/bookings/my');
    } catch (err) {
      // 409 conflicts are normalised to plain Error by the axios interceptor
      if (err instanceof Error && !err.response) {
        setError(err.message);
      } else {
        const msg = err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Failed to submit booking.';
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">New Booking</h2>
        <p className="text-sm text-gray-500 mt-1">Reserve a campus resource</p>
      </div>

      {/* Resource card */}
      {loadingResource ? (
        <div className="text-sm text-gray-400 py-4">Loading resource…</div>
      ) : resourceError ? (
        <div className="text-sm text-red-500 py-4">{resourceError}</div>
      ) : resource ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg shrink-0">🏛️</div>
          <div>
            <p className="font-semibold text-gray-800">{resource.name}</p>
            <p className="text-xs text-gray-500">
              {TYPE_LABELS[resource.type] || resource.type} · {resource.location} · Capacity {resource.capacity}
            </p>
          </div>
        </div>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
        {!resourceId && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Resource ID <span className="text-red-500">*</span></label>
            <input
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              required
              placeholder="Enter resource ID"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Start Time <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">End Time <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Expected Attendees <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="expectedAttendees"
            value={form.expectedAttendees}
            onChange={handleChange}
            min="1"
            max={resource?.capacity || undefined}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {resource?.capacity && (
            <p className="text-xs text-gray-400">Maximum capacity: {resource.capacity}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Purpose <span className="text-red-500">*</span></label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe the purpose of this booking…"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Booking'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
