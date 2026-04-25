import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResourceById, deleteResource } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Globe,
  Info,
  CalendarCheck,
  Activity
} from 'lucide-react';

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Research Lab',
  MEETING_ROOM: 'Executive Suite',
  EQUIPMENT: 'Precision Equipment',
};

const STATUS_STYLES = {
  ACTIVE: 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20',
  OUT_OF_SERVICE: 'bg-red-500/10 text-red-400 border-red-500/20',
  MAINTENANCE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  INACTIVE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await getResourceById(id);
        setResource(res.data);
      } catch (err) {
        setError('Security violation: Unable to access resource dossier.');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Decommission this facility resource?')) return;
    try {
      await deleteResource(id);
      navigate('/resources');
    } catch (err) {
      alert('Security override: Decommissioning protocol failed.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Decoding Resource Matrix..." />;
  if (error || !resource) return (
    <div className="flex flex-col items-center justify-center py-40">
       <div className="p-10 luna-card border-red-500/20 text-center">
          <Globe size={48} className="text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{error || 'Resource Not Found'}</h2>
          <button onClick={() => navigate('/resources')} className="luna-button-outline">Back to Portfolio</button>
       </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
      
      {/* Dynamic Header Navigation */}
      <div className="flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="group flex items-center gap-4 text-text-muted hover:text-luna-aqua transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-luna-midnight border border-luna-aqua/5 flex items-center justify-center group-hover:border-luna-aqua/30 group-hover:shadow-lg group-hover:shadow-luna-aqua/10 transition-all">
               <ArrowLeft size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Portfolio</span>
         </button>

         {isAdmin && (
            <div className="flex gap-4">
               <button 
                 onClick={() => navigate(`/admin/resources/edit/${id}`)}
                 className="luna-button-outline !px-8 !py-4 flex items-center gap-3"
               >
                 <Edit3 size={18} /> Modify Configuration
               </button>
               <button 
                 onClick={handleDelete}
                 className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
               >
                 <Trash2 size={20} />
               </button>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* Left Column: Visual & Critical Stats */}
         <div className="lg:col-span-5 space-y-10">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="luna-card !p-0 overflow-hidden group hover:border-luna-aqua/20 transition-all"
            >
               <div className="h-80 bg-luna-midnight/80 relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  <div className="text-9xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700 shadow-2xl">
                     {resource.resourceType === 'LECTURE_HALL' ? '🏛️' : resource.resourceType === 'LAB' ? '🧪' : resource.resourceType === 'MEETING_ROOM' ? '💼' : '🛠️'}
                  </div>
                  <div className="absolute top-8 left-8">
                     <span className={`luna-badge !px-6 !py-2 text-[10px] font-black shadow-xl ${STATUS_STYLES[resource.status]}`}>
                        {resource.status}
                     </span>
                  </div>
               </div>
               <div className="p-10 border-t border-luna-aqua/10">
                  <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{resource.resourceName}</h1>
                  <p className="text-[11px] font-black text-luna-aqua uppercase tracking-[0.5em] mb-10">{TYPE_LABELS[resource.resourceType]}</p>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-6 p-6 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5">
                        <div className="w-14 h-14 rounded-2xl bg-luna-aqua/10 flex items-center justify-center text-luna-aqua shadow-inner">
                           <ShieldCheck size={24} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Resource Code</p>
                           <p className="text-xl font-black text-white">{resource.resourceCode}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>

            <div className="luna-card !p-10 space-y-8">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                  <Activity size={14} className="text-luna-aqua" /> Operational Metadata
               </h3>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Floor Level</p>
                     <p className="text-lg font-black text-white">{resource.floor}</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Room Matrix</p>
                     <p className="text-lg font-black text-white">{resource.roomNumber}</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Added On</p>
                     <p className="text-sm font-bold text-white">{new Date(resource.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Last Update</p>
                     <p className="text-sm font-bold text-white">{new Date(resource.updatedAt).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Detailed Intelligence */}
         <div className="lg:col-span-7 space-y-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="luna-card !p-10 space-y-12"
            >
               <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                     <Info size={14} className="text-luna-aqua" /> Infrastructure Description
                  </h3>
                  <p className="text-xl font-medium text-text-muted leading-relaxed italic opacity-90 border-l-4 border-luna-aqua/20 pl-8 py-2">
                     {resource.description || 'No detailed architectural dossier available for this resource.'}
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-8 rounded-[2.5rem] bg-luna-midnight/60 border border-luna-aqua/5 hover:border-luna-aqua/20 transition-all group">
                     <Users size={32} className="text-luna-aqua mb-6 group-hover:scale-110 transition-transform" />
                     <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2">Maximum Capacity</h4>
                     <p className="text-4xl font-black text-white">{resource.capacity} <span className="text-lg text-text-muted font-bold">Persons</span></p>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-luna-midnight/60 border border-luna-aqua/5 hover:border-luna-aqua/20 transition-all group">
                     <MapPin size={32} className="text-luna-aqua mb-6 group-hover:scale-110 transition-transform" />
                     <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2">Building Sector</h4>
                     <p className="text-4xl font-black text-white truncate">{resource.building}</p>
                  </div>
               </div>

               <div className="space-y-8">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                     <Clock size={14} className="text-luna-aqua" /> Availability Protocol
                  </h3>
                  <div className="p-10 rounded-[2.5rem] bg-luna-aqua/5 border border-luna-aqua/10 flex flex-col md:flex-row items-center justify-around gap-8 text-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-luna-aqua/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     <div className="space-y-4 relative z-10">
                        <p className="text-[9px] font-black text-luna-aqua uppercase tracking-[0.5em]">Sector Opening</p>
                        <p className="text-5xl font-black text-white">{resource.availableFrom}</p>
                     </div>
                     <div className="h-16 w-px bg-luna-aqua/10 hidden md:block" />
                     <div className="space-y-4 relative z-10">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.5em]">Sector Closing</p>
                        <p className="text-5xl font-black text-white">{resource.availableTo}</p>
                     </div>
                  </div>
               </div>

               <div className="pt-10">
                  <button 
                     onClick={() => navigate('/bookings/new', { state: { resourceId: id, resourceName: resource.resourceName } })}
                     className="w-full luna-button !py-6 text-sm font-black uppercase tracking-[0.4em] shadow-2xl shadow-luna-aqua/30 flex items-center justify-center gap-6 group"
                  >
                     <CalendarCheck size={24} className="group-hover:scale-110 transition-transform" />
                     Initialize Resource Reservation
                  </button>
               </div>
            </motion.div>
         </div>

      </div>

      {/* Global Security Status */}
      <div className="flex items-center justify-between pt-12 border-t border-luna-aqua/10 text-[9px] font-black text-text-muted uppercase tracking-[0.5em]">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
            Infrastructure Dossier Verified
         </div>
         <div className="flex items-center gap-8">
            <span>Node: SMART-UNI-01</span>
            <span>Security: Level 4</span>
         </div>
      </div>

    </div>
  );
}
