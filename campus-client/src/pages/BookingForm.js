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
      const msg = err.response?.data?.message || err.response?.data || 'Failed to submit booking.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Redesigned Header */}
      <div className="bg-[#10B981] rounded-[2rem] p-8 text-white shadow-lg shadow-emerald-500/10">
        <h1 className="text-2xl font-black mb-1">New Booking</h1>
        <p className="text-emerald-50 text-sm font-medium">Complete the details below to reserve your resource.</p>
      </div>

      {/* Resource card - Enhanced */}
      {loadingResource ? (
        <div className="flex items-center gap-3 text-sm text-slate-400 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
           <div className="w-4 h-4 rounded-full bg-slate-200"></div>
           Loading resource details...
        </div>
      ) : resourceError ? (
        <div className="text-sm text-rose-500 py-4 px-6 bg-rose-50 rounded-2xl border border-rose-100 font-bold">
           ⚠️ {resourceError}
        </div>
      ) : resource ? (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-[#10B981] rounded-2xl flex items-center justify-center text-white text-2xl shadow-inner shrink-0 rotate-3 group-hover:rotate-0 transition-transform">
             {resource.type === 'EQUIPMENT' ? '🛠️' : '🏛️'}
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{resource.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] bg-white px-2 py-0.5 rounded border border-emerald-100">
                {TYPE_LABELS[resource.type] || resource.type}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                📍 {resource.location}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                👥 Cap: {resource.capacity}
              </span>
            </div>
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
