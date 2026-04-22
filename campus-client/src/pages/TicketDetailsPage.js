import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTicketById, 
  assignTechnician, 
  updateTicketStatus, 
  getAllUsers, 
  addComment, 
  deleteTicket, 
  uploadAttachment 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Clock, 
  ShieldAlert, 
  Paperclip, 
  Send, 
  Trash2, 
  Settings,
  MapPin,
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
  Layers,
  ShieldCheck,
  ChevronRight,
  Globe,
  Plus
} from 'lucide-react';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();   
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [ticket, setTicket] = useState(null);    
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    type: '', 
    title: '', 
    message: '', 
    data: null 
  });
  
  const [selectedTech, setSelectedTech] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketRes, usersRes] = await Promise.all([
        getTicketById(id),
        user.role === 'ADMIN' ? getAllUsers() : Promise.resolve({ data: [] })
      ]);
      setTicket(ticketRes.data);
      if (user.role === 'ADMIN') {
        setTechnicians(usersRes.data.filter(u => u.role === 'TECHNICIAN'));
      }
    } catch (error) {
      addToast('Failed to load incident intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAction = () => {
    if (!selectedTech) return;
    const techName = technicians.find(t => t.id === selectedTech)?.username;
    setModalState({
      isOpen: true,
      type: 'assign',
      title: 'Confirm Assignment',
      message: `Assign this incident dossier to Specialist ${techName}?`,
      data: selectedTech
    });
  };

  const handleStatusAction = (newStatus) => {
    setModalState({
      isOpen: true,
      type: 'status',
      title: 'Update Status',
      message: `Synchronize incident status to ${newStatus.replace('_', ' ')}?`,
      data: newStatus
    });
  };

  const performAction = async () => {
    try {
      if (modalState.type === 'assign') {
        await assignTechnician(id, { technicianId: modalState.data });
        addToast('Specialist successfully assigned', 'success');
      } else if (modalState.type === 'status') {
        await updateTicketStatus(id, { status: modalState.data });
        addToast(`Status synchronized to ${modalState.data}`, 'success');
      } else if (modalState.type === 'delete_ticket') {
        await deleteTicket(id);
        addToast('Incident record purged', 'success');
        navigate('/tickets');
        return;
      }
      fetchData();
    } catch (error) {
      addToast('Action sequence failed', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      await addComment(id, newComment);
      setNewComment('');
      fetchData();
      addToast('Personnel transmission logged', 'success');
    } catch (error) {
      addToast('Transmission failure', 'error');
    } finally {
      setCommenting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      await uploadAttachment(id, file);
      fetchData();
      addToast('Digital artifact uploaded', 'success');
    } catch (error) {
      addToast('Artifact transmission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !ticket) return <LoadingSpinner fullScreen message="Accessing Incident Archive..." />;
  if (!ticket) return (
    <div className="p-40 text-center flex flex-col items-center gap-8">
      <XCircle size={80} className="text-luna-aqua opacity-20" />
      <h2 className="text-4xl font-black text-white tracking-tighter">Incident Not Found</h2>
      <button onClick={() => navigate('/tickets')} className="luna-button-outline">Return to Registry</button>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/tickets')} 
            className="w-14 h-14 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className={`luna-badge ${getStatusStyles(ticket.status)}`}>{ticket.status.replace('_', ' ')}</span>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Ref: #{ticket.id.substring(0, 12)}</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">{ticket.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-2 rounded-2xl bg-luna-aqua/5 border border-luna-aqua/10 flex items-center gap-3">
              <Activity size={16} className={getPriorityStyles(ticket.priority).icon} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityStyles(ticket.priority).text}`}>{ticket.priority} Priority Delta</span>
           </div>
           {user.role === 'ADMIN' && (
             <button 
               onClick={() => setModalState({ isOpen: true, type: 'delete_ticket', title: 'Purge Record', message: 'Permanently remove this incident dossier from the central registry?' })}
               className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
             >
               <Trash2 size={20} />
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Core Intelligence Panel */}
        <div className="xl:col-span-8 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luna-card !p-0 overflow-hidden"
          >
            <div className="p-10 border-b border-luna-aqua/10 bg-luna-midnight/40 flex justify-between items-center">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                 <ShieldAlert size={18} className="text-luna-aqua" /> Discrepancy Narrative
               </h3>
               <Zap size={18} className="text-luna-aqua/20" />
            </div>

            <div className="p-12">
               <p className="text-white font-medium text-xl leading-relaxed border-l-2 border-luna-aqua/20 pl-10 mb-12">
                 {ticket.description}
               </p>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 luna-glass rounded-[2.5rem] border-luna-aqua/5">
                 <IntelItem icon={<Layers size={16} />} label="Category" value={ticket.category} />
                 <IntelItem icon={<MapPin size={16} />} label="Sector" value={ticket.location || 'Central Alpha'} />
                 <IntelItem icon={<Globe size={16} />} label="Asset Sync" value={ticket.resourceId?.substring(0, 12) || 'Agnostic'} />
                 <IntelItem icon={<Clock size={16} />} label="Temporal Log" value={new Date(ticket.createdAt).toLocaleDateString()} />
               </div>
            </div>
          </motion.div>

          {/* Communication Thread */}
          <div className="luna-card !p-0 overflow-hidden">
            <div className="p-10 border-b border-luna-aqua/10 bg-luna-midnight/40 flex justify-between items-center">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <MessageSquare size={18} className="text-luna-aqua" /> Personnel Transmission Log
               </h3>
               <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">{ticket.comments?.length || 0} Threads</span>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="space-y-10 mb-10 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment, i) => {
                    const isMe = comment.userId === user.id;
                    return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-6 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-sm shrink-0 border ${isMe ? 'bg-luna-aqua text-luna-midnight border-luna-aqua luna-glow' : 'bg-luna-midnight border-luna-aqua/20 text-luna-aqua'}`}>
                          {comment.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={`p-8 rounded-[2.5rem] border ${isMe ? 'bg-luna-aqua/5 border-luna-aqua/30' : 'bg-luna-midnight/40 border-luna-aqua/10'} max-w-[85%]`}>
                          <div className="flex justify-between items-center mb-4 gap-8">
                            <span className="text-xs font-black text-white uppercase tracking-widest">{comment.username}</span>
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{new Date(comment.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-base text-text-muted font-medium leading-relaxed">{comment.text}</p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6">
                    <MessageSquare size={64} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Personnel Transmissions</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="pt-10 border-t border-luna-aqua/5">
                <div className="relative group">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Log mission details..."
                    className="luna-input !p-8 !pr-40 !rounded-[2.5rem] min-h-[160px] resize-none text-base leading-relaxed"
                  />
                  <button 
                    type="submit"
                    disabled={commenting || !newComment.trim()}
                    className="absolute right-6 bottom-6 luna-button !px-10 !py-4 shadow-xl shadow-luna-aqua/20"
                  >
                    <Send size={20} /> Transmit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Operational Command Sidebar */}
        <div className="xl:col-span-4 space-y-12">
          
          <div className="luna-card !p-10">
            <h3 className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em] mb-10 pb-6 border-b border-luna-aqua/10 flex items-center justify-between">
               Mission Parameters <Settings size={14} />
            </h3>
            
            <div className="space-y-10">
              {/* Assignment Hub */}
              <div>
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] block mb-6">Assigned Specialist</label>
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-luna-midnight/60 border border-luna-aqua/5 group hover:border-luna-aqua/20 transition-all">
                  <div className="w-14 h-14 luna-glass rounded-[1.25rem] flex items-center justify-center text-luna-aqua group-hover:luna-glow transition-all">
                    <User size={28} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-base font-black text-white block truncate tracking-tight">{ticket.assignedTechnician || 'Dispatch Pending'}</span>
                    <span className="text-[9px] text-luna-cyan font-black uppercase tracking-widest mt-1 block">Field Personnel</span>
                  </div>
                </div>
              </div>

              {/* Admin Dispatch Override */}
              {user.role === 'ADMIN' && (
                <div className="space-y-6 pt-10 border-t border-luna-aqua/5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] block">Dispatch Specialist Override</label>
                  <div className="relative group">
                     <select 
                       value={selectedTech}
                       onChange={(e) => setSelectedTech(e.target.value)}
                       className="luna-input !py-4 !pl-12 appearance-none cursor-pointer"
                     >
                       <option value="">Awaiting Specialist Selection...</option>
                       {technicians.map(t => (
                         <option key={t.id} value={t.id} className="bg-luna-midnight text-white">{t.username}</option>
                       ))}
                     </select>
                     <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" />
                  </div>
                  <button 
                    onClick={handleAssignAction}
                    disabled={!selectedTech}
                    className="w-full luna-button !py-4 flex items-center justify-center gap-3 shadow-lg shadow-luna-aqua/10"
                  >
                    Confirm Dispatch <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Specialist Workflow Transition */}
              {(user.role === 'ADMIN' || (user.role === 'TECHNICIAN' && ticket.assignedTechnician === user.username)) && (
                <div className="pt-10 border-t border-luna-aqua/5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] block mb-6">Workflow Synchronization</label>
                  <div className="grid grid-cols-1 gap-4">
                    {ticket.status === 'OPEN' && (
                      <button onClick={() => handleStatusAction('IN_PROGRESS')} className="w-full luna-button !py-4 flex items-center justify-center gap-3 shadow-lg shadow-luna-aqua/10">
                        <Activity size={18} /> Initiate Progress
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleStatusAction('RESOLVED')} className="w-full luna-button !bg-luna-cyan !text-luna-midnight !py-4 flex items-center justify-center gap-3 shadow-lg shadow-luna-cyan/20">
                        <CheckCircle2 size={18} /> Signal Resolution
                      </button>
                    )}
                    {ticket.status !== 'CLOSED' && (
                      <button onClick={() => handleStatusAction('CLOSED')} className="w-full luna-button-outline !py-4 flex items-center justify-center gap-3">
                        Archive Record
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Digital Artifact Repository */}
          <div className="luna-card !p-10">
            <div className="flex items-center justify-between mb-10 border-b border-luna-aqua/10 pb-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Digital Artifacts</h3>
              <label className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all cursor-pointer">
                <Plus size={18} />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="space-y-6">
              {ticket.attachments && ticket.attachments.length > 0 ? (
                ticket.attachments.map((file, i) => (
                  <a 
                    key={i} 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-6 p-6 rounded-[2rem] bg-luna-midnight/40 border border-luna-aqua/5 hover:border-luna-aqua/30 transition-all group"
                  >
                    <div className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua group-hover:luna-glow transition-all">
                      <Paperclip size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate tracking-tight">{file.filename}</p>
                      <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-1">Capture Artifact</p>
                    </div>
                  </a>
                ))
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-luna-aqua/5 rounded-[2.5rem] opacity-20">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Artifacts Logged</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <ConfirmationModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={performAction}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type === 'delete_ticket' ? 'danger' : 'info'}
      />
    </div>
  );
}

const IntelItem = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2 mb-3 text-luna-cyan opacity-60">
       {icon}
       <span className="text-[9px] font-black uppercase tracking-[0.3em]">{label}</span>
    </div>
    <p className="text-base font-black text-white truncate tracking-tight">{value || 'Syncing...'}</p>
  </div>
);

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-luna-steel/10 text-luna-cyan border-luna-cyan/20';
    case 'IN_PROGRESS': return 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20';
    case 'RESOLVED': return 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow';
    default: return 'bg-luna-midnight text-text-muted border-luna-aqua/5';
  }
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'CRITICAL': return { text: 'text-red-400', icon: <ShieldAlert className="text-red-500 luna-glow" /> };
    case 'HIGH': return { text: 'text-luna-aqua', icon: <Zap className="text-luna-aqua luna-glow" /> };
    case 'MEDIUM': return { text: 'text-luna-cyan', icon: <Activity className="text-luna-cyan" /> };
    default: return { text: 'text-text-muted', icon: <Clock className="text-text-muted" /> };
  }
};
