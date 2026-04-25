import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTicketById, 
  assignTechnician, 
  updateTicketStatus, 
  resolveTicket,
  rejectTicket,
  closeTicket,
  reopenTicket,
  addComment, 
  updateComment,
  deleteComment as apiDeleteComment,
  deleteTicket,
  updateTicket,
  uploadAttachment 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion } from 'framer-motion';
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
  Edit2,
  MapPin,
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
  Layers,
  Globe,
  Plus,
  Mail,
  Phone
} from 'lucide-react';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();   
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [ticket, setTicket] = useState(null);    
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    type: '', 
    title: '', 
    message: '', 
    data: null,
    inputLabel: '',
    inputValue: ''
  });
  

  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ticketRes = await getTicketById(id);
      setTicket(ticketRes.data);
    } catch (error) {
      addToast('Failed to load incident intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = (newStatus) => {
    if (newStatus === 'RESOLVED') {
      setModalState({
        isOpen: true,
        type: 'resolve',
        title: 'Resolve Ticket',
        message: `Please provide resolution notes for this incident.`,
        data: newStatus,
        inputLabel: 'Resolution Notes',
        inputValue: ''
      });
    } else if (newStatus === 'REJECTED') {
      setModalState({
        isOpen: true,
        type: 'reject',
        title: 'Reject Ticket',
        message: `Please provide a reason for rejecting this incident.`,
        data: newStatus,
        inputLabel: 'Rejection Reason',
        inputValue: ''
      });
    } else {
      setModalState({
        isOpen: true,
        type: 'status',
        title: 'Update Status',
        message: `Synchronize incident status to ${newStatus.replace('_', ' ')}?`,
        data: newStatus,
        inputLabel: '',
        inputValue: ''
      });
    }
  };

  const performAction = async () => {
    try {
      if (modalState.type === 'assign') {
        await assignTechnician(id, { technicianId: modalState.data });
        addToast('Specialist successfully assigned', 'success');
      } else if (modalState.type === 'status') {
        await updateTicketStatus(id, { status: modalState.data });
        addToast(`Status synchronized to ${modalState.data}`, 'success');
      } else if (modalState.type === 'resolve') {
        if (!modalState.inputValue) {
           addToast('Resolution notes are required', 'error');
           return;
        }
        await resolveTicket(id, { resolutionNotes: modalState.inputValue });
        addToast(`Incident successfully resolved`, 'success');
      } else if (modalState.type === 'reject') {
        if (!modalState.inputValue) {
           addToast('Rejection reason is required', 'error');
           return;
        }
        await rejectTicket(id, { rejectionReason: modalState.inputValue });
        addToast(`Incident rejected`, 'success');
      } else if (modalState.type === 'delete_ticket') {
        await deleteTicket(id);
        addToast('Incident record purged', 'success');
        navigate('/tickets');
        return;
      }
      fetchData();
      setModalState({ ...modalState, isOpen: false });
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

  const handleEditComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      await updateComment(id, commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText('');
      fetchData();
      addToast('Transmission updated', 'success');
    } catch (error) {
      addToast('Update failed', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this transmission?')) return;
    try {
      await apiDeleteComment(id, commentId);
      fetchData();
      addToast('Transmission purged', 'success');
    } catch (error) {
      addToast('Purge failed', 'error');
    }
  };

  const handleStartEdit = () => {
    setEditFormData({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      location: ticket.location || '',
      preferredContactName: ticket.preferredContactName || '',
      preferredContactEmail: ticket.preferredContactEmail || '',
      preferredContactPhone: ticket.preferredContactPhone || '',
      resourceId: ticket.resourceId || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateTicket(id, editFormData);
      setIsEditing(false);
      fetchData();
      addToast('Ticket updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update ticket', 'error');
    }
  };

  const handleOwnerClose = async () => {
    if (!window.confirm('Confirm the issue is fixed and close this ticket?')) return;
    try {
      await closeTicket(id);
      fetchData();
      addToast('Ticket closed — issue confirmed as resolved', 'success');
    } catch (error) {
      addToast('Failed to close ticket', 'error');
    }
  };

  const handleOwnerReopen = async () => {
    if (!window.confirm('Mark this ticket as not fixed and reopen it?')) return;
    try {
      await reopenTicket(id);
      fetchData();
      addToast('Ticket reopened — technician will be notified', 'success');
    } catch (error) {
      addToast('Failed to reopen ticket', 'error');
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
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      
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
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Code: {ticket.ticketCode}</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">{ticket.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-2 rounded-2xl bg-luna-aqua/5 border border-luna-aqua/10 flex items-center gap-3">
              {React.cloneElement(getPriorityStyles(ticket.priority).icon, { size: 16 })}
              <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityStyles(ticket.priority).text}`}>{ticket.priority} Priority Delta</span>
           </div>
           {(user.role === 'ADMIN' || user.role === 'TECHNICIAN' || (user.role === 'USER' && ticket.createdById === user.id)) && (
             <button 
               onClick={() => setModalState({ isOpen: true, type: 'delete_ticket', title: 'Delete Ticket', message: 'Permanently delete this ticket? This action cannot be undone.' })}
               className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20 flex-shrink-0 flex items-center justify-center"
             >
               <Trash2 size={20} />
             </button>
           )}
           {user.role === 'USER' && ticket.createdById === user.id && ticket.status === 'OPEN' && (
             <button
               onClick={handleStartEdit}
               className="w-12 h-12 rounded-2xl bg-luna-aqua/10 text-luna-aqua border border-luna-aqua/20 hover:bg-luna-aqua hover:text-luna-midnight transition-all shadow-lg hover:shadow-luna-aqua/20 flex-shrink-0 flex items-center justify-center"
             >
               <Edit2 size={20} />
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

            <div className="p-12 space-y-8">
               <p className="text-white font-medium text-xl leading-relaxed border-l-2 border-luna-aqua/20 pl-10">
                 {ticket.description}
               </p>

               {ticket.status === 'RESOLVED' && ticket.resolutionNotes && (
                  <div className="bg-luna-aqua/10 border border-luna-aqua/20 rounded-[2rem] p-8">
                     <h4 className="text-xs font-black text-luna-aqua uppercase tracking-[0.3em] mb-4">Resolution Notes</h4>
                     <p className="text-white text-base">{ticket.resolutionNotes}</p>
                     <p className="text-[10px] text-text-muted mt-2">Resolved At: {new Date(ticket.resolvedAt).toLocaleString()}</p>
                  </div>
               )}

               {ticket.status === 'REJECTED' && ticket.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8">
                     <h4 className="text-xs font-black text-red-400 uppercase tracking-[0.3em] mb-4">Rejection Reason</h4>
                     <p className="text-white text-base">{ticket.rejectionReason}</p>
                  </div>
               )}

               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 luna-glass rounded-[2.5rem] border-luna-aqua/5 mt-12">
                 <IntelItem icon={<Layers size={16} />} label="Category" value={ticket.category} />
                 <IntelItem icon={<MapPin size={16} />} label="Sector" value={ticket.location || 'Central Alpha'} />
                 <IntelItem icon={<Globe size={16} />} label="Asset Sync" value={ticket.resourceId?.substring(0, 12) || 'Agnostic'} />
                 <IntelItem icon={<Clock size={16} />} label="Temporal Log" value={new Date(ticket.createdAt).toLocaleDateString()} />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 luna-glass rounded-[2.5rem] border-luna-aqua/5 mt-8">
                 <IntelItem icon={<User size={16} />} label="Contact Name" value={ticket.preferredContactName} />
                 <IntelItem icon={<Mail size={16} />} label="Contact Email" value={ticket.preferredContactEmail} />
                 <IntelItem icon={<Phone size={16} />} label="Contact Phone" value={ticket.preferredContactPhone} />
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
                    let isRightSide = comment.userId === user.id;
                    if (comment.userRole) {
                      const isSupportStaff = user.role === 'ADMIN' || user.role === 'TECHNICIAN';
                      const isCommentFromSupport = comment.userRole === 'ADMIN' || comment.userRole === 'TECHNICIAN';
                      isRightSide = isSupportStaff ? isCommentFromSupport : comment.userId === user.id;
                    }
                    
                    return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: isRightSide ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-6 ${isRightSide ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-sm shrink-0 border ${isRightSide ? 'bg-luna-aqua text-luna-midnight border-luna-aqua luna-glow' : 'bg-luna-midnight border-luna-aqua/20 text-luna-aqua'}`}>
                          {comment.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={`p-8 rounded-[2.5rem] border ${isRightSide ? 'bg-luna-aqua/5 border-luna-aqua/30' : 'bg-luna-midnight/40 border-luna-aqua/10'} max-w-[85%] group/comment relative`}>
                          <div className="flex justify-between items-center mb-4 gap-8">
                            <span className="text-xs font-black text-white uppercase tracking-widest">{comment.username}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{new Date(comment.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                              {comment.userId === user.id && (
                                <div className="flex items-center gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }} className="text-luna-aqua hover:text-white transition-colors">
                                    <Edit2 size={12} />
                                  </button>
                                  <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="space-y-4">
                              <textarea 
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="luna-input w-full !p-4 !rounded-xl text-sm"
                                rows={3}
                              />
                              <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingCommentId(null)} className="text-xs font-black text-text-muted hover:text-white uppercase tracking-widest transition-colors">Cancel</button>
                                <button onClick={() => handleEditComment(comment.id)} className="text-xs font-black text-luna-aqua hover:text-white uppercase tracking-widest transition-colors">Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-base text-text-muted font-medium leading-relaxed">{comment.text}</p>
                          )}
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
                    <span className="text-base font-black text-white block truncate tracking-tight">{ticket.assignedTechnicianName || 'Dispatch Pending'}</span>
                    <span className="text-[9px] text-luna-cyan font-black uppercase tracking-widest mt-1 block">Field Personnel</span>
                  </div>
                </div>
              </div>



              {/* Specialist Workflow Transition — technician only */}
              {user.role === 'TECHNICIAN' && ticket.assignedTechnicianId === user.id && (
                <div className="pt-10 border-t border-luna-aqua/5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] block mb-6">Workflow Synchronization</label>
                  <div className="grid grid-cols-1 gap-4">
                    {ticket.status === 'OPEN' && (
                      <>
                        <button onClick={() => handleStatusAction('IN_PROGRESS')} className="w-full luna-button !py-4 flex items-center justify-center gap-3 shadow-lg shadow-luna-aqua/10">
                          <Activity size={18} /> Initiate Progress
                        </button>
                        <button onClick={() => handleStatusAction('REJECTED')} className="w-full luna-button-outline !py-4 flex items-center justify-center gap-3 !text-red-400 !border-red-500/20 hover:!bg-red-500/10 hover:!border-red-500/40">
                          <XCircle size={18} /> Reject Incident
                        </button>
                      </>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleStatusAction('RESOLVED')} className="w-full luna-button !bg-luna-cyan !text-luna-midnight !py-4 flex items-center justify-center gap-3 shadow-lg shadow-luna-cyan/20">
                        <CheckCircle2 size={18} /> Signal Resolution
                      </button>
                    )}
                    {ticket.status === 'RESOLVED' && (
                      <button onClick={() => handleStatusAction('CLOSED')} className="w-full luna-button-outline !py-4 flex items-center justify-center gap-3">
                        Archive Record
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Ticket Owner Edit — shown when ticket is OPEN */}
              {user.role === 'USER' && ticket.createdById === user.id && ticket.status === 'OPEN' && isEditing && (
                <div className="pt-10 border-t border-luna-aqua/5">
                  <label className="text-[9px] font-black text-luna-aqua uppercase tracking-[0.3em] block mb-6">Edit Ticket Details</label>
                  <div className="space-y-4">
                    <input
                      value={editFormData.title || ''}
                      onChange={e => setEditFormData(p => ({ ...p, title: e.target.value }))}
                      placeholder="Title"
                      className="luna-input !py-3 !px-4 text-sm w-full"
                    />
                    <textarea
                      value={editFormData.description || ''}
                      onChange={e => setEditFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Description"
                      rows={4}
                      className="luna-input !py-3 !px-4 text-sm w-full resize-none"
                    />
                    <select
                      value={editFormData.priority || 'MEDIUM'}
                      onChange={e => setEditFormData(p => ({ ...p, priority: e.target.value }))}
                      className="luna-input !py-3 !px-4 text-sm w-full appearance-none"
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent Priority</option>
                    </select>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSaveEdit} className="flex-1 luna-button !py-3 text-xs flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> Save Changes
                      </button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 luna-button-outline !py-3 text-xs flex items-center justify-center gap-2 !text-text-muted !border-luna-aqua/10">
                        <XCircle size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Owner Confirmation — shown when ticket is RESOLVED */}
              {user.role === 'USER' && ticket.createdById === user.id && ticket.status === 'RESOLVED' && (
                <div className="pt-10 border-t border-luna-aqua/5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] block mb-2">Was your issue resolved?</label>
                  <p className="text-[9px] text-text-muted mb-6">The technician has marked this ticket as resolved. Please confirm.</p>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={handleOwnerClose}
                      className="w-full luna-button !bg-luna-aqua !text-luna-midnight !py-4 flex items-center justify-center gap-3 shadow-lg shadow-luna-aqua/20"
                    >
                      <CheckCircle2 size={18} /> Yes, Issue Fixed
                    </button>
                    <button
                      onClick={handleOwnerReopen}
                      className="w-full luna-button-outline !py-4 flex items-center justify-center gap-3 !text-red-400 !border-red-500/20 hover:!bg-red-500/10 hover:!border-red-500/40"
                    >
                      <XCircle size={18} /> No, Still Not Fixed
                    </button>
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
                    href={`http://localhost:8080${file.url}`}
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
        type={modalState.type === 'delete_ticket' || modalState.type === 'reject' ? 'danger' : 'info'}
        inputLabel={modalState.inputLabel}
        inputValue={modalState.inputValue}
        onInputChange={(val) => setModalState({ ...modalState, inputValue: val })}
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
    case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-luna-midnight text-text-muted border-luna-aqua/5';
  }
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'URGENT': return { text: 'text-red-400', icon: <ShieldAlert className="text-red-500 luna-glow" /> };
    case 'HIGH': return { text: 'text-luna-aqua', icon: <Zap className="text-luna-aqua luna-glow" /> };
    case 'MEDIUM': return { text: 'text-luna-cyan', icon: <Activity className="text-luna-cyan" /> };
    default: return { text: 'text-text-muted', icon: <Clock className="text-text-muted" /> };
  }
};
