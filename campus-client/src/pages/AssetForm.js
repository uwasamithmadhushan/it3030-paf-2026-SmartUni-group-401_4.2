import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllAssets, createAsset, updateAsset } from '../services/api';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE'];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

const STATUS_LABELS = {
  ACTIVE: 'Active',
  OUT_OF_SERVICE: 'Out of Service',
};

const EMPTY_FORM = {
  name: '',
  type: '',
  capacity: '',
  location: '',
  status: '',
  availabilityWindows: [{ from: '08:00:00', to: '17:00:00' }],
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.type) errors.type = 'Resource type is required.';
  if (!form.capacity || Number(form.capacity) <= 0)
    errors.capacity = 'Capacity must be greater than 0.';
  if (!form.location.trim()) errors.location = 'Location is required.';
  if (!form.status) errors.status = 'Status is required.';
  return errors;
};

export default function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loadingAsset, setLoadingAsset] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getAllAssets()
      .then((res) => {
        const asset = res.data.find((a) => a.id === id);
        if (asset) {
          setForm({
            name: asset.name || '',
            type: asset.type || '',
            capacity: asset.capacity || '',
            location: asset.location || '',
            status: asset.status || '',
            availabilityWindows:
              asset.availabilityWindows?.length > 0
                ? asset.availabilityWindows
                : [{ from: '08:00:00', to: '17:00:00' }],
          });
        } else {
          setApiError('Asset not found.');
        }
      })
      .catch(() => setApiError('Failed to load asset data.'))
      .finally(() => setLoadingAsset(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleWindowChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.availabilityWindows];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, availabilityWindows: updated };
    });
  };

  const addWindow = () => {
    setForm((prev) => ({
      ...prev,
      availabilityWindows: [...prev.availabilityWindows, { from: '08:00:00', to: '17:00:00' }],
    }));
  };

  const removeWindow = (index) => {
    setForm((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError('');

    const payload = {
      ...form,
      capacity: Number(form.capacity),
    };

    try {
      if (isEdit) {
        await updateAsset(id, payload);
      } else {
        await createAsset(payload);
      }
      navigate('/facilities');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save asset. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAsset) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading asset data…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Asset' : 'Add New Asset'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? 'Update the resource details below.' : 'Fill in the form to register a new campus resource.'}
        </p>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Main Lecture Hall A"
            className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-300'
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type <span className="text-red-500">*</span></label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={`w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 ${
              errors.type ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-300'
            }`}
          >
            <option value="">Select type…</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
        </div>

        {/* Capacity & Location side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              min="1"
              placeholder="e.g. 60"
              className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.capacity ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-300'
              }`}
            />
            {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Block A"
              className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.location ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-300'
              }`}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={`w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 ${
              errors.status ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-300'
            }`}
          >
            <option value="">Select status…</option>
            {RESOURCE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
        </div>

        {/* Availability Windows */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Availability Windows</label>
            <button
              type="button"
              onClick={addWindow}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + Add Window
            </button>
          </div>
          <div className="space-y-2">
            {form.availabilityWindows.map((w, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500 w-5">{i + 1}.</span>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-gray-500">From</label>
                  <input
                    type="time"
                    value={w.from?.substring(0, 5) || '08:00'}
                    onChange={(e) => handleWindowChange(i, 'from', e.target.value + ':00')}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                  <label className="text-xs text-gray-500">To</label>
                  <input
                    type="time"
                    value={w.to?.substring(0, 5) || '17:00'}
                    onChange={(e) => handleWindowChange(i, 'to', e.target.value + ':00')}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                </div>
                {form.availabilityWindows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWindow(i)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/facilities')}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEdit ? 'Update Asset' : 'Create Asset'}
          </button>
        </div>
      </form>
    </div>
  );
}
