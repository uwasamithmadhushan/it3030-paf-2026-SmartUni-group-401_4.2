import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createResource, updateResource, getResourceById } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

import { 
  Building2, 
  Save, 
  ArrowLeft, 
  Clock, 
  Layers,
  Activity,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'INACTIVE'];

export default function AdminResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    resourceCode: '',
    resourceName: '',
    resourceType: 'LECTURE_HALL',
    capacity: 0,
    building: '',
    floor: '',
    roomNumber: '',
    description: '',
    availableFrom: '08:00',
    availableTo: '18:00',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchResource = async () => {
        try {
          const res = await getResourceById(id);
          setFormData(res.data);
        } catch (err) {
          showToast('Failed to load resource data.', 'error');
          navigate('/resources');
        } finally {
          setLoading(false);
        }
      };
      fetchResource();
    }
  }, [id, isEdit, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateResource(id, formData);
        showToast('Resource configuration updated successfully.', 'success');
      } else {
        await createResource(formData);
        showToast('New resource registered in global matrix.', 'success');
      }
      navigate('/resources');
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed: Logic violation.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading Configuration Interface..." />;

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
      
      {/* Control Header */}
      <div className="flex items-center justify-between pb-10 border-b border-luna-aqua/10">
         <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-text-muted hover:text-luna-aqua transition-colors">
               <ArrowLeft size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cancel Operation</span>
            </button>
            <h1 className="text-5xl font-black text-white tracking-tighter">
               {isEdit ? 'Modify' : 'Register'} <span className="text-luna-aqua">Resource</span>
            </h1>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* Left Column: Primary Config */}
         <div className="lg:col-span-8 space-y-10">
            <div className="luna-card !p-10 space-y-10">
               <div className="flex items-center gap-4 text-luna-aqua border-b border-luna-aqua/5 pb-6">
                  <ShieldCheck size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Core Identification</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Resource Code</label>
                     <input
                        type="text"
                        name="resourceCode"
                        value={formData.resourceCode}
                        onChange={handleChange}
                        required
                        disabled={isEdit}
                        placeholder="e.g. LH-101"
                        className="luna-input !py-4 disabled:opacity-50"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Resource Name</label>
                     <input
                        type="text"
                        name="resourceName"
                        value={formData.resourceName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Great Hall A"
                        className="luna-input !py-4"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Classification</label>
                     <div className="relative">
                        <select
                           name="resourceType"
                           value={formData.resourceType}
                           onChange={handleChange}
                           className="luna-input !py-4 appearance-none"
                        >
                           {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </select>
                        <Layers size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Max Capacity</label>
                     <div className="relative">
                        <input
                           type="number"
                           name="capacity"
                           value={formData.capacity}
                           onChange={handleChange}
                           min="0"
                           className="luna-input !py-4 !pr-20"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-muted uppercase">Pax</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Operational Description</label>
                  <textarea
                     name="description"
                     value={formData.description}
                     onChange={handleChange}
                     rows="4"
                     placeholder="Detailed resource dossier..."
                     className="luna-input !py-4 resize-none"
                  />
               </div>
            </div>

            <div className="luna-card !p-10 space-y-10">
               <div className="flex items-center gap-4 text-luna-aqua border-b border-luna-aqua/5 pb-6">
                  <Clock size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Availability Protocol</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Opening Time</label>
                     <input
                        type="time"
                        name="availableFrom"
                        value={formData.availableFrom}
                        onChange={handleChange}
                        required
                        className="luna-input !py-4"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Closing Time</label>
                     <input
                        type="time"
                        name="availableTo"
                        value={formData.availableTo}
                        onChange={handleChange}
                        required
                        className="luna-input !py-4"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Meta & Location */}
         <div className="lg:col-span-4 space-y-10">
            <div className="luna-card !p-10 space-y-10">
               <div className="flex items-center gap-4 text-luna-aqua border-b border-luna-aqua/5 pb-6">
                  <Building2 size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Physical Sector</h3>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Building</label>
                     <input
                        type="text"
                        name="building"
                        value={formData.building}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Science Block"
                        className="luna-input !py-4"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Floor</label>
                     <input
                        type="text"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Ground"
                        className="luna-input !py-4"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Room Number</label>
                     <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        required
                        placeholder="e.g. G-01"
                        className="luna-input !py-4"
                     />
                  </div>
               </div>
            </div>

            <div className="luna-card !p-10 space-y-10">
               <div className="flex items-center gap-4 text-luna-aqua border-b border-luna-aqua/5 pb-6">
                  <Activity size={20} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Deployment Status</h3>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block ml-2">Operational State</label>
                     <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="luna-input !py-4 appearance-none"
                     >
                        {RESOURCE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                     </select>
                  </div>

                  <div className="p-6 rounded-3xl bg-luna-aqua/5 border border-luna-aqua/10 flex items-start gap-4">
                     <AlertCircle size={20} className="text-luna-aqua shrink-0 mt-1" />
                     <p className="text-[10px] font-medium text-text-muted leading-relaxed uppercase tracking-wider">
                        Registered resources are immediately available for global synchronization. Ensure building sectors are correctly mapped.
                     </p>
                  </div>
               </div>
            </div>

            <button 
               type="submit" 
               disabled={saving}
               className="w-full luna-button !py-6 text-sm font-black uppercase tracking-[0.4em] shadow-2xl shadow-luna-aqua/30 flex items-center justify-center gap-4 group disabled:opacity-50"
            >
               {saving ? 'Synchronizing...' : isEdit ? 'Update Configuration' : 'Authorize Deployment'}
               <Save size={20} className={saving ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
            </button>
         </div>

      </form>
      
      {/* Footer Info */}
      <div className="flex items-center justify-between text-[9px] font-black text-text-muted uppercase tracking-[0.5em] pt-10 border-t border-luna-aqua/10">
         <span>SmartUni Interface Protocol v4.2</span>
         <span>Security Level: Authorized Administrator</span>
      </div>

    </div>
  );
}
