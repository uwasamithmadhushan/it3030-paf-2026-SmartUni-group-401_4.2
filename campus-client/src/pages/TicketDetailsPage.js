import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, assignTechnician, updateTicketStatus, getAllUsers, addComment, deleteComment, updateComment, deleteTicket, uploadAttachment, deleteAttachment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

const TicketDetailsPage = () => {
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
      addToast('Failed to load ticket details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAction = () => {
    if (!selectedTech) {
      addToast('Please select a technician first', 'info');
      return;
    }
    const techName = technicians.find(t => t.id === selectedTech)?.username;
    setModalState({
      isOpen: true,
      type: 'assign',
      title: 'Confirm Assignment',
      message: `Are you sure you want to assign this ticket to ${techName}?`,
      data: selectedTech
    });
  };

  const handleStatusAction = (newStatus) => {
    setModalState({
      isOpen: true,
      type: 'status',
      title: 'Update Ticket Status',
      message: newStatus === 'REJECTED' ? 'Reason for rejection?' : `Move this ticket to ${newStatus.replace('_', ' ')}?`,
      data: newStatus,
      isInput: newStatus === 'REJECTED'
    });
  };

  const handleDeleteAction = () => {
    setModalState({
      isOpen: true,
      type: 'delete_ticket',
      title: 'Delete Ticket',
      message: 'Are you sure you want to permanently remove this ticket?',
      data: null
    });
  };

  const performAction = async () => {
    try {
      if (modalState.type === 'assign') {
        await assignTechnician(id, { technicianId: modalState.data });
        addToast('Technician assigned successfully', 'success');
      } else if (modalState.type === 'status') {
        await updateTicketStatus(id, { 
          status: modalState.data,
          note: modalState.reason || `Status updated to ${modalState.data} by ${user.username}` 
        });
        addToast(`Ticket status updated to ${modalState.data}`, 'success');
      } else if (modalState.type === 'edit_comment') {
        await updateComment(id, modalState.data.id, modalState.reason);
        addToast('Comment updated successfully', 'success');
      } else if (modalState.type === 'delete_ticket') {
        await deleteTicket(id);
        addToast('Ticket deleted successfully', 'success');
        navigate('/tickets');
        return;
      }
      fetchData();
    } catch (error) {
      addToast('Requested action failed', 'error');
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
      addToast('Comment added', 'success');
    } catch (error) {
      addToast('Failed to add comment', 'error');
    } finally {
      setCommenting(false);
    }
  };

  const handleEditCommentAction = (comment) => {
    setModalState({
      isOpen: true,
      type: 'edit_comment',
      title: 'Edit Comment',
      message: 'Modify your comment below:',
      data: comment,
      isInput: true,
      initialValue: comment.text
    });
  };

  const handleDeleteAttachment = async (filename) => {
    try {
      const actualFilename = filename.split('/').pop();
      await deleteAttachment(id, actualFilename);
      fetchData();
      addToast('Attachment removed', 'success');
    } catch (error) {
      addToast('Failed to delete attachment', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      await uploadAttachment(id, file);
      fetchData();
      addToast('File uploaded successfully', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!ticket) return (
    <div className="p-20 text-center">
      <div className="text-6xl mb-4">😿</div>
      <h2 className="text-2xl font-bold">Ticket not found</h2>
      <button onClick={() => navigate('/tickets')} className="mt-4 text-indigo-600 font-bold hover:underline">Back to List</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 relative z-0">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-full h-80 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[150%] bg-white/5 blur-[120px] rounded-full mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-6xl">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/tickets')} 
              className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all active:scale-95 text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 border border-white/20">
                🎫 Ticket #{ticket.id.substring(0, 8)}
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">Ticket Details</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Primary Info Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
               {/* Status Banner Gradient */}
               <div className={`absolute top-0 right-0 left-0 h-2 bg-gradient-to-r ${getStatusBannerGradient(ticket.status)} opacity-80`}></div>
               
               <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${getStatusStyles(ticket.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${getStatusDotColor(ticket.status)}`}></span>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged</span>
                    <span className="text-xs font-bold text-slate-700">{new Date(ticket.createdAt).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
               </div>

               <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">{ticket.title}</h2>
               
               <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 md:p-8 rounded-3xl border border-slate-100 mb-8 relative">
                 <svg className="absolute top-4 right-4 w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                 <p className="text-slate-700 text-lg leading-relaxed font-medium relative z-10 whitespace-pre-wrap">
                   {ticket.description}
                 </p>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <DetailItem icon="🏷️" label="Category" value={ticket.category} />
                  <DetailItem icon="📍" label="Location" value={ticket.location || 'N/A'} />
                  <DetailItem icon="📞" label="Contact" value={ticket.contactDetails || 'N/A'} />
                  <DetailItem 
                    icon="⚡"
                    label="Priority" 
                    value={ticket.priority} 
                    valueClass={`font-black tracking-widest uppercase text-xs ${getPriorityColor(ticket.priority)}`} 
                  />
               </div>
               
               <div className="mt-6 flex flex-wrap items-center justify-between gap-4 px-2">
                  <DetailItem icon="👤" label="Reporter" value={ticket.createdByUsername || 'System User'} isBadge />
                  {ticket.resourceId && <DetailItem icon="🔗" label="Linked Asset" value={`Asset #${ticket.resourceId.substring(0,8)}`} isBadge />}
               </div>
            </div>

            {/* Discussion Thread */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
               <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                 </div>
                 Discussion Thread
               </h3>
               
               <div className="space-y-6 mb-10">
                 {ticket.comments && ticket.comments.length > 0 ? (
                   ticket.comments.map((comment, i) => {
                     const isMyComment = comment.userId === user.id;
                     return (
                       <div key={i} className={`flex gap-4 items-start group ${isMyComment ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${isMyComment ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                           {comment.username.charAt(0).toUpperCase()}
                         </div>
                         <div className={`relative max-w-[80%] p-5 rounded-3xl border transition-all ${isMyComment ? 'bg-indigo-50 border-indigo-100 rounded-tr-sm' : 'bg-slate-50/80 border-slate-100 rounded-tl-sm hover:bg-white hover:shadow-md'}`}>
                           <div className={`flex justify-between items-center mb-2 gap-4 ${isMyComment ? 'flex-row-reverse' : ''}`}>
                             <span className={`text-[11px] font-black uppercase tracking-widest ${isMyComment ? 'text-indigo-900' : 'text-slate-700'}`}>{comment.username}</span>
                             <span className="text-[10px] font-bold text-slate-400">{new Date(comment.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                           </div>
                           <p className={`text-sm leading-relaxed font-medium ${isMyComment ? 'text-indigo-800 text-right' : 'text-slate-600'}`}>{comment.text}</p>
                           
                           {(user.role === 'ADMIN' || isMyComment) && (
                             <button 
                               onClick={() => handleDeleteComment(comment.id)}
                               className={`absolute -top-2 ${isMyComment ? '-left-2' : '-right-2'} w-7 h-7 bg-white text-red-400 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md hover:text-red-600 hover:bg-red-50`}
                               title="Delete Comment"
                             >
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                           )}
                         </div>
                       </div>
                     );
                   })
                 ) : (
                   <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                     <span className="text-3xl mb-2">🎈</span>
                     <p className="text-slate-400 font-bold text-sm">Quiet in here... Make the first comment!</p>
                   </div>
                 )}
               </div>
  
               <form onSubmit={handleAddComment} className="relative group">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-md opacity-0 group-focus-within:opacity-20 transition-opacity duration-500"></div>
                 <div className="relative bg-white rounded-3xl border-2 border-slate-100 group-focus-within:border-indigo-500 overflow-hidden transition-colors">
                   <textarea
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     placeholder="Type your message here..."
                     className="w-full p-6 pb-16 bg-transparent border-none focus:ring-0 text-sm font-medium resize-none m-0"
                     rows="3"
                   ></textarea>
                   <div className="absolute right-3 bottom-3 left-3 flex justify-between items-center bg-white pt-2">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3 hidden sm:block">Press Post to send</span>
                     <button 
                       type="submit"
                       disabled={commenting || !newComment.trim()}
                       className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all ml-auto flex items-center gap-2"
                     >
                       <span>Post</span>
                       <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                     </button>
                   </div>
                 </div>
               </form>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                Audit Timeline
              </h3>
              <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[3px] before:bg-indigo-50 before:rounded-full">
                {ticket.updates && ticket.updates.length > 0 ? (
                  ticket.updates.map((update, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[35.5px] top-1 w-[18px] h-[18px] rounded-full border-[4px] border-white bg-indigo-400 group-hover:bg-indigo-600 group-hover:scale-125 transition-all shadow-sm z-10"></div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Log #{idx + 1}</span>
                          <span className="text-[11px] font-bold text-slate-400">{new Date(update.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-colors">
                          <p className="text-slate-900 font-black mb-1.5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {update.statusUpdate || 'Status Update'}
                          </p>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">{update.note || 'Workflow transition triggered implicitly.'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 font-bold text-sm italic py-4 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">No lifecycle events recorded yet.</div>
                )}
              </div>
            </div>
          </div>
  
          {/* Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-8 relative">
            <div className="sticky top-8 space-y-8">
              
              {/* Action Center Panel */}
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white">
                <h3 className="font-black text-lg text-slate-900 mb-8 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                  Action Center
                </h3>
                
                <div className="space-y-8">
                  {/* Assigned Tech Box */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Assigned Expert</label>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${ticket.assignedTechnicianName ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-200' : 'bg-slate-300 shadow-none'}`}>
                          {ticket.assignedTechnicianName ? ticket.assignedTechnicianName.charAt(0).toUpperCase() : '?'}
                        </div>
                        {ticket.assignedTechnicianName && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 block truncate">{ticket.assignedTechnicianName || 'Pending Assignment'}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest truncate ${ticket.assignedTechnicianName ? 'text-indigo-500' : 'text-slate-400'}`}>
                          {ticket.assignedTechnicianName ? 'Lead Technician' : 'Awaiting Staff'}
                        </span>
                      </div>
                    </div>
                  </div>
  
                  {/* Admin Reassign */}
                  {user.role === 'ADMIN' && (
                    <div className="pt-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Delegate Task</label>
                      <div className="space-y-3">
                        <div className="relative">
                          <select 
                            value={selectedTech}
                            onChange={(e) => setSelectedTech(e.target.value)}
                            className="w-full pl-6 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 transition-all text-slate-700"
                          >
                            <option value="">-- Choose Staff --</option>
                            {technicians.map(t => (
                              <option key={t.id} value={t.id}>{t.username}</option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                          </div>
                        </div>
                        <button 
                          onClick={handleAssignAction}
                          disabled={!selectedTech}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] disabled:opacity-30 disabled:shadow-none hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                          Execute Assignment
                        </button>
                      </div>
                    </div>
                  )}
  
                  {/* Workflow Transitions */}
                   {(user.role === 'ADMIN' || (user.role === 'TECHNICIAN' && ticket.assignedTechnicianId === user.id)) && (
                    <div className="pt-8 border-t border-slate-100">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center justify-between">
                         Workflow State
                         <span className="bg-slate-100 px-2 rounded-sm tracking-normal capitalize text-slate-500">Live</span>
                       </label>
                       <div className="grid grid-cols-1 gap-3">
                         {ticket.status === 'OPEN' && (
                           <button onClick={() => handleStatusAction('IN_PROGRESS')} className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             Commence Work
                           </button>
                         )}
                         {ticket.status === 'IN_PROGRESS' && (
                           <button onClick={() => handleStatusAction('RESOLVED')} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:from-emerald-600 hover:to-green-600 transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             Mark Resolved
                           </button>
                         )}
                         {user.role === 'ADMIN' && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                           <button onClick={() => handleStatusAction('REJECTED')} className="w-full py-4 bg-white text-orange-600 border border-orange-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-all active:scale-95">
                              Reject Ticket
                            </button>
                         )}
                         {ticket.status !== 'CLOSED' && (
                           <button onClick={() => handleStatusAction('CLOSED')} className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                             Close Ticket
                           </button>
                         )}
                       </div>
                    </div>
                  )}
  
                  {/* Delete Zone */}
                  {(user.role === 'ADMIN' || ticket.createdById === user.id) && (
                    <div className="pt-6">
                      <button 
                        onClick={handleDeleteAction}
                        className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 flex justify-center items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete Request
                      </button>
                    </div>
                  )}
                </div>
             </div>
             
             {/* Evidence Panel */}
             <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white">
               <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">📎</div>
                 Attached Evidence
               </h3>
               <div className="space-y-4">
                 {ticket.attachments && ticket.attachments.length > 0 ? (
                   ticket.attachments.map((file, i) => {
                     const isImg = file.url.match(/\.(jpeg|jpg|gif|png)$/) != null;
                     return (
                        <div key={i} className="group relative">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-purple-200 hover:shadow-[0_4px_15px_rgba(168,85,247,0.1)] transition-all truncate group-hover:-translate-y-0.5"
                          >
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl overflow-hidden shadow-sm shrink-0">
                              {isImg ? <img src={file.url} alt="thumb" className="w-full h-full object-cover" /> : '📄'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-bold text-slate-700 block truncate group-hover:text-purple-700 transition-colors">{file.filename}</span>
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{file.fileType || 'File Asset'}</span>
                            </div>
                            <svg className="w-5 h-5 text-slate-300 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        </div>
                     );
                   })
                 ) : (
                   <div className="text-center py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                     <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Media Found</span>
                   </div>
                 )}
               </div>
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
          type={modalState.type === 'assign' || modalState.data === 'RESOLVED' ? 'info' : 'danger'}
          confirmText={modalState.type === 'assign' ? 'Commit Assignment' : 'Execute Update'}
        />
      </div>
    </div>
  );
};

/* --- UI Helper Functions --- */

const DetailItem = ({ icon, label, value, valueClass = "font-black text-slate-900", isBadge = false }) => (
  <div className={isBadge ? "flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm" : "space-y-1.5"}>
    {isBadge && <span className="text-xl">{icon}</span>}
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {!isBadge && <span>{icon}</span>}
        {label}
      </p>
      <p className={`text-base truncate tracking-tight pt-0.5 ${valueClass}`}>
        {typeof value === 'string' ? value.replace('_', ' ') : value}
      </p>
    </div>
  </div>
);

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-50/80 text-blue-700 border-blue-200';
    case 'IN_PROGRESS': return 'bg-amber-50/80 text-amber-700 border-amber-200';
    case 'RESOLVED': return 'bg-emerald-50/80 text-emerald-700 border-emerald-200';
    case 'CLOSED': return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'REJECTED': return 'bg-rose-50/80 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-500';
  }
};

const getStatusDotColor = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-500';
    case 'IN_PROGRESS': return 'bg-amber-500';
    case 'RESOLVED': return 'bg-emerald-500';
    case 'CLOSED': return 'bg-slate-400';
    case 'REJECTED': return 'bg-rose-500';
    default: return 'bg-slate-400';
  }
};

const getStatusBannerGradient = (status) => {
  switch (status) {
    case 'OPEN': return 'from-blue-400 to-blue-600';
    case 'IN_PROGRESS': return 'from-amber-400 to-amber-600';
    case 'RESOLVED': return 'from-emerald-400 to-green-500';
    case 'CLOSED': return 'from-slate-300 to-slate-400';
    case 'REJECTED': return 'from-rose-400 to-red-500';
    default: return 'from-indigo-400 to-purple-500';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'text-rose-600';
    case 'HIGH': return 'text-orange-500';
    case 'MEDIUM': return 'text-amber-500';
    case 'LOW': return 'text-emerald-500';
    default: return 'text-slate-500';
  }
};

export default TicketDetailsPage;
