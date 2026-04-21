import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllAssets, createAsset, updateAsset } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE'];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Research Lab',
  MEETING_ROOM: 'Executive Suite',
  EQUIPMENT: 'Precision Equipment',
};

const EMPTY_FORM = {
  name: '',
  type: '',
  capacity: '',
  location: '',
  status: '',
  availabilityWindows: [{ from: '08:00:00', to: '17:00:00' }],
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
            availabilityWindows: asset.availabilityWindows?.length > 0 ? asset.availabilityWindows : [{ from: '08:00:00', to: '17:00:00' }],
          });
        }
      })
      .finally(() => setLoadingAsset(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleWindowChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.availabilityWindows];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, availabilityWindows: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) await updateAsset(id, form);
      else await createAsset(form);
      navigate('/facilities');
    } catch (err) {
      setApiError('Failed to synchronize resource data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAsset) return <LoadingSpinner fullScreen message="Consulting Blueprints..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-luxury font-['Outfit']">
      
      {/* Header */}
      <div className="pb-8 border-b border-ivory-warm/10">
        <h2 className="text-4xl font-black text-ivory-warm tracking-tight">
          {isEdit ? 'Refine Asset' : 'Register Resource'}
        </h2>
        <p className="text-sm font-bold text-blush-soft uppercase tracking-widest mt-2">
          {isEdit ? 'Executive Modification' : 'New Strategic Addition'}
        </p>
      </div>

      {apiError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-400">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="luxury-card space-y-8 bg-violet-deep/20">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-4">Resource Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Main Lecture Hall A"
                className="luxury-input"
              />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-4">Classification</label>
              <select name="type" value={form.type} onChange={handleChange} className="luxury-input">
                <option value="">Select Category</option>
                {RESOURCE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-4">Occupancy Tier</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="Ex: 100" className="luxury-input" />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-4">Hub Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Ex: Block A" className="luxury-input" />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-blush-soft uppercase tracking-widest ml-4">Current Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="luxury-input">
                <option value="">Select Status</option>
                {RESOURCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
        </div>

        <div className="pt-6 border-t border-ivory-warm/5">
           <div className="flex items-center justify-between mb-6">
              <label className="text-xs font-black text-ivory-warm uppercase tracking-widest">Operational Windows</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, availabilityWindows: [...f.availabilityWindows, { from: '08:00:00', to: '17:00:00' }] }))} className="text-[10px] font-black text-blush-soft uppercase tracking-widest hover:text-ivory-warm transition-colors">+ New Window</button>
           </div>
           <div className="space-y-4">
              {form.availabilityWindows.map((w, i) => (
                <div key={i} className="flex flex-wrap items-center gap-4 bg-white/5 p-6 rounded-2xl border border-ivory-warm/5">
                   <div className="flex-1 min-w-[120px] space-y-2">
                      <span className="text-[9px] font-black text-blush-soft uppercase">From</span>
                      <input type="time" value={w.from?.substring(0, 5)} onChange={(e) => handleWindowChange(i, 'from', e.target.value + ':00')} className="luxury-input !py-2" />
                   </div>
                   <div className="flex-1 min-w-[120px] space-y-2">
                      <span className="text-[9px] font-black text-blush-soft">To</span>
                      <input type="time" value={w.to?.substring(0, 5)} onChange={(e) => handleWindowChange(i, 'to', e.target.value + ':00')} className="luxury-input !py-2" />
                   </div>
                   {form.availabilityWindows.length > 1 && (
                     <button type="button" onClick={() => setForm(f => ({ ...f, availabilityWindows: f.availabilityWindows.filter((_, idx) => idx !== i) }))} className="mt-6 text-rose-400 hover:text-rose-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                   )}
                </div>
              ))}
           </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-8 border-t border-ivory-warm/5">
          <button type="button" onClick={() => navigate('/facilities')} className="text-[10px] font-black text-ivory-warm/40 uppercase tracking-widest hover:text-ivory-warm transition-all">Cancel</button>
          <button type="submit" disabled={submitting} className="luxury-button !text-xs uppercase tracking-[0.2em]">{submitting ? 'Synchronizing...' : isEdit ? 'Confirm Modifications' : 'Finalize Creation'}</button>
        </div>
      </form>
    </div>
  );
}
