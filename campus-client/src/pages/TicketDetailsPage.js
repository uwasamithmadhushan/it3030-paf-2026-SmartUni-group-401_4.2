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
  const [uploading, setUploading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    type: '', 
    title: '', 
    message: '', 
    data: null 
  });

  useEffect(() => {
    let isMounted = true;
    if (user) {
      fetchData(false, isMounted);
      const interval = setInterval(() => fetchData(true, isMounted), 30000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [id, user]);

  const fetchData = async (isRefresh = false, isMounted = true) => {
    if (!user) return;
    if (!isRefresh && isMounted) setLoading(true);
    try {
      const [ticketRes, usersRes] = await Promise.all([
        getTicketById(id),
        user.role === 'ADMIN' ? getAllUsers() : Promise.resolve({ data: [] })
      ]);
      if (!isMounted) return;
      setTicket(ticketRes.data);
      if (user.role === 'ADMIN') {
        setTechnicians(usersRes.data.filter(u => u.role === 'TECHNICIAN'));
      }
    } catch (error) {
      if (!isMounted) return;
      console.error('Fetch error:', error);
      if (!isRefresh) {
        const message = error.response?.status === 404 
          ? 'Ticket not found. It may have been deleted.' 
          : error.response?.status === 403 
            ? 'Access denied. You do not have permission to view this ticket.'
            : 'Failed to load ticket details. Please try again.';
        addToast(message, 'error');
      }
    } finally {
      if (!isRefresh && isMounted) setLoading(false);
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
      title: 'Delete Incident Report',
      message: 'Are you sure you want to permanently delete this incident report? This action cannot be undone and will remove all associated data.',
      confirmText: 'Delete Ticket',
      type_color: 'danger'
    });
  };

  const performAction = async (inputValue) => {
    try {
      if (modalState.type === 'assign') {
        await assignTechnician(id, { technicianId: modalState.data });
        addToast('Technician assigned successfully', 'success');
      } else if (modalState.type === 'status') {
        await updateTicketStatus(id, { 
          status: modalState.data,
          note: inputValue || `Status updated to ${modalState.data} by ${user.username}` 
        });
        addToast(`Ticket status updated to ${modalState.data}`, 'success');
      } else if (modalState.type === 'edit_comment') {
        await updateComment(id, modalState.data.id, inputValue);
        addToast('Comment updated successfully', 'success');
      } else if (modalState.type === 'delete_comment') {
        await deleteComment(id, modalState.data);
        addToast('Comment deleted successfully', 'success');
      } else if (modalState.type === 'delete_ticket') {
        await deleteTicket(id);
        addToast('Ticket deleted successfully', 'success');
        navigate('/tickets');
        return;
      }
      fetchData(true);
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
      fetchData(true);
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

  const handleDeleteCommentAction = (commentId) => {
    setModalState({
      isOpen: true,
      type: 'delete_comment',
      title: 'Delete Comment',
      message: 'Are you sure you want to permanently remove this comment?',
      data: commentId
    });
  };

  const handleDeleteAttachment = async (filename) => {
    try {
      const actualFilename = filename.split('/').pop();
      await deleteAttachment(id, actualFilename);
      fetchData(true);
      addToast('Attachment removed', 'success');
    } catch (error) {
      addToast('Failed to delete attachment', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset input so the same file can be selected again
    e.target.value = '';
    setUploading(true);
    try {
      await uploadAttachment(id, file);
      fetchData(true);
      addToast('File uploaded successfully', 'success');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Upload failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!ticket) return (
    <div className="p-20 text-center">
      <div className="text-6xl mb-4">😿</div>
      <h2 className="text-2xl font-bold">Ticket not found</h2>
      <button onClick={() => navigate('/tickets')} className="mt-4 text-emerald-600 font-bold hover:underline">Back to List</button>
    </div>
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Compact Premium Header Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
        <div className="p-6 lg:p-8">
          {/* Top Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/tickets')}
                className="group flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl transition-all border border-slate-100 hover:border-emerald-200"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                <span className="text-xs font-black uppercase tracking-widest">Back</span>
              </button>
              
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ref</span>
                <span className="text-[10px] font-black text-slate-900">#{ticket.id.substring(0, 8).toUpperCase()}</span>
              </div>

              <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 ${getStatusStyles(ticket.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(ticket.status)}`}></div>
                {ticket.status.replace('_', ' ')}
              </div>
            </div>

            <div className="flex items-center gap-4 relative">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] hidden md:block">
                Last Activity: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
              </span>
              <button 
                onClick={() => setShowActionMenu(!showActionMenu)}
                className={`p-2 rounded-lg transition-all ${showActionMenu ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </button>

              {/* Action Dropdown Menu */}
              {showActionMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {(user.role === 'ADMIN' || ticket.createdById === user.id) && (
                    <button 
                      onClick={() => { setShowActionMenu(false); handleDeleteAction(); }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete Ticket
                    </button>
                  )}
                  <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title & Subtitle Area */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
              {ticket.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Incident Ticket</span>
              <span className="text-slate-300">•</span>
              <p className="text-xs font-bold text-slate-500">
                Reported by <span className="text-slate-900">{ticket.createdByUsername || 'Student'}</span>
              </p>
            </div>
          </div>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-50 pt-8">
            <MetaChip 
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              label="Reporter"
              value={ticket.createdByUsername || 'User'}
              color="emerald"
            />
            <MetaChip 
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              label="Filing Date"
              value={new Date(ticket.createdAt).getFullYear() === 1970 ? 'Not Available' : new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              color="amber"
            />
            {ticket.priority && (
              <MetaChip 
                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-7h1" /></svg>}
                label="Priority"
                value={ticket.priority}
                color="rose"
              />
            )}
            {ticket.category && (
              <MetaChip 
                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                label="Category"
                value={ticket.category}
                color="slate"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area (Left Column - spans 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Detailed Content Section */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Incident Description</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full report details</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-10">
              <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                {ticket.description}
              </p>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModernInfoCard label="Category" value={ticket.category.replace('_', ' ')} icon="📁" />
              <ModernInfoCard label="Location" value={ticket.location || 'Not Specified'} icon="📍" />
              <ModernInfoCard label="Contact Info" value={ticket.contactDetails || 'None provided'} icon="📞" />
              <ModernInfoCard 
                label="Urgency Level" 
                value={ticket.priority} 
                icon="⚡"
                highlightColor={getPriorityColor(ticket.priority).split(' ')[1]}
              />
            </div>
          </div>

          {/* Discussion Thread */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Collaboration Feed</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update timeline</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mb-8">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, i) => {
                  const isMyComment = comment.userId === user.id || comment.username === user.username;
                  return (
                    <div key={i} className={`flex gap-4 items-start group ${isMyComment ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isMyComment ? 'bg-[#10B981] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={`relative max-w-[85%] p-4 rounded-2xl border ${isMyComment ? 'bg-emerald-50 border-emerald-100 rounded-tr-sm' : 'bg-slate-50 border-slate-100 rounded-tl-sm'}`}>
                        <div className={`flex justify-between items-center mb-2 gap-4 ${isMyComment ? 'flex-row-reverse' : ''}`}>
                          <span className={`text-xs font-bold ${isMyComment ? 'text-emerald-900' : 'text-slate-900'}`}>{comment.username}</span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(comment.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className={`text-sm ${isMyComment ? 'text-emerald-900 text-right' : 'text-slate-700'}`}>{comment.text}</p>
                        
                        {(user.role === 'ADMIN' || isMyComment) && (
                          <div className={`absolute -top-3 ${isMyComment ? '-left-3' : '-right-3'} flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-sm border border-slate-200 rounded-full p-0.5`}>
                            {isMyComment && (
                              <button 
                                onClick={() => handleEditCommentAction(comment)}
                                className="w-6 h-6 text-slate-400 rounded-full flex items-center justify-center hover:text-[#10B981] hover:bg-emerald-50 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteCommentAction(comment.id)}
                              className="w-6 h-6 text-slate-400 rounded-full flex items-center justify-center hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm font-medium">No comments yet. Start the discussion!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative">
              <div className="bg-white rounded-xl border border-slate-200 focus-within:border-[#10B981] overflow-hidden transition-colors shadow-sm">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-4 bg-transparent border-none focus:ring-0 text-sm resize-none m-0 outline-none"
                  rows="3"
                ></textarea>
                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">Press Post to send</span>
                  <button 
                    type="submit"
                    disabled={commenting || !newComment.trim()}
                    className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors ml-auto"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Right Sidebar (Action Center & Meta) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Action Center - The Command Hub */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Command Center</h3>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Assignment Flow */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Support Assignment</label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                    {ticket.assignedTechnicianName ? ticket.assignedTechnicianName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-black text-slate-900 block leading-tight">{ticket.assignedTechnicianName || 'No Staff Assigned'}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.assignedTechnicianName ? 'Designated Technician' : 'Pending Review'}</span>
                  </div>
                </div>

                {user.role === 'ADMIN' && (
                  <div className="mt-6 space-y-3">
                    <select 
                      value={selectedTech}
                      onChange={(e) => setSelectedTech(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:border-[#10B981] focus:ring-4 focus:ring-emerald-50 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choose Personnel...</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.username}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAssignAction}
                      disabled={!selectedTech || selectedTech === ticket.assignedTechnicianId}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${
                        !selectedTech 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                          : selectedTech === ticket.assignedTechnicianId
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none'
                            : 'bg-[#10B981] text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-900/20'
                      }`}
                    >
                      {selectedTech === ticket.assignedTechnicianId ? '✓ Personnel Confirmed' : 'Deploy Staff'}
                    </button>
                  </div>
                )}
              </div>

              {/* Resolution Progress */}
              {(user.role === 'ADMIN' || (user.role === 'TECHNICIAN' && ticket.assignedTechnicianId === user.id)) && (
                <div className="pt-8 border-t border-slate-50">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Resolution Flow</label>
                  <div className="grid grid-cols-1 gap-3">
                    {ticket.status === 'OPEN' && (
                      <button onClick={() => handleStatusAction('IN_PROGRESS')} className="w-full py-3.5 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95">
                        Initialize Resolution
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleStatusAction('RESOLVED')} className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                        Verify Resolution
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {user.role === 'ADMIN' && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                        <button onClick={() => handleStatusAction('REJECTED')} className="py-3 bg-white text-rose-600 border border-rose-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95">
                          Reject
                        </button>
                      )}
                      {ticket.status !== 'CLOSED' && (
                        <button onClick={() => handleStatusAction('CLOSED')} className="py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Destructive Actions */}
              {(user.role === 'ADMIN' || ticket.createdById === user.id) && (
                <div className="pt-8 border-t border-slate-50">
                  <button 
                    onClick={handleDeleteAction}
                    className="w-full py-3.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete Ticket
                  </button>
                  <p className="mt-4 text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] text-center">Permanent system removal</p>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900">Attachments</h3>
              {(user.role === 'ADMIN' || ticket.createdById === user.id) && ticket.attachments?.length < 3 && (
                uploading ? (
                  <span className="text-xs font-bold text-emerald-600 animate-pulse">Uploading...</span>
                ) : (
                  <label className="cursor-pointer text-[#10B981] hover:text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    + Add File
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                  </label>
                )
              )}
            </div>
            
            <div className="space-y-3">
              {ticket.attachments && ticket.attachments.length > 0 ? (
                ticket.attachments.map((file, i) => {
                  const fileUrl = file.url.startsWith('http') ? file.url : `http://localhost:8080${file.url}`;
                  const isImg = /\.(jpeg|jpg|gif|png|webp)$/i.test(file.url);
                  return (
                    <div key={i} className="group relative flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {isImg ? <img src={fileUrl} alt="thumb" className="w-full h-full object-cover" /> : '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{file.filename}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{file.fileType || 'File'}</p>
                        </div>
                      </a>
                      {(user.role === 'ADMIN' || ticket.createdById === user.id) && (
                        <button 
                          onClick={() => handleDeleteAttachment(file.url)}
                          className="w-6 h-6 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-white shadow-sm border border-slate-100"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 font-medium">No attachments</p>
              )}
            </div>
          </div>
          
          {/* Audit Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Timeline</h3>
            <div className="relative pl-4 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {ticket.updates && ticket.updates.length > 0 ? (
                ticket.updates.map((update, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[18.5px] top-1.5 w-2 h-2 rounded-full border border-white bg-[#10B981]"></div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        {new Date(update.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                      </span>
                      <p className="text-xs text-slate-900 font-bold">{update.statusUpdate || 'Status Update'}</p>
                      {update.note && <p className="text-[10px] text-slate-500 mt-0.5">{update.note}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No events recorded.</p>
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
        type={modalState.type_color || (modalState.type === 'assign' || modalState.data === 'RESOLVED' ? 'info' : 'danger')}
        confirmText={modalState.confirmText || (modalState.type === 'assign' ? 'Assign' : 'Confirm')}
        isInput={modalState.isInput}
        initialValue={modalState.initialValue}
      />
    </div>
  );
};

/* --- UI Helper Functions --- */

const DetailItem = ({ label, value, valueClass = "font-bold text-slate-900" }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm truncate ${valueClass}`}>
      {typeof value === 'string' ? value.replace('_', ' ') : value}
    </p>
  </div>
);

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-amber-50/80 text-amber-600 border border-amber-200/50';
    case 'IN_PROGRESS': return 'bg-blue-50/80 text-blue-600 border border-blue-200/50';
    case 'RESOLVED': return 'bg-emerald-50/80 text-emerald-600 border border-emerald-200/50';
    case 'REJECTED': return 'bg-rose-50/80 text-rose-600 border border-rose-200/50';
    case 'CLOSED': return 'bg-slate-50/80 text-slate-600 border border-slate-200/50';
    default: return 'bg-slate-50/80 text-slate-500 border border-slate-200/50';
  }
};

const getStatusDotColor = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-amber-400';
    case 'IN_PROGRESS': return 'bg-blue-400';
    case 'RESOLVED': return 'bg-emerald-400';
    case 'CLOSED': return 'bg-slate-400';
    case 'REJECTED': return 'bg-rose-400';
    default: return 'bg-slate-400';
  }
};

const MetaChip = ({ icon, label, value, color = "slate" }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100"
  };

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all hover:shadow-sm ${colors[color]}`}>
      <div className="shrink-0 opacity-80">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</p>
        <p className="text-[11px] font-bold truncate leading-none">{value.replace('_', ' ')}</p>
      </div>
    </div>
  );
};

const getStatusBorderColor = (status) => {
  switch (status) {
    case 'OPEN': return 'border-amber-400 shadow-amber-900/5';
    case 'IN_PROGRESS': return 'border-blue-400 shadow-blue-900/5';
    case 'RESOLVED': return 'border-emerald-400 shadow-emerald-900/5';
    case 'CLOSED': return 'border-slate-400 shadow-slate-900/5';
    case 'REJECTED': return 'border-rose-400 shadow-rose-900/5';
    default: return 'border-emerald-400 shadow-emerald-900/5';
  }
};

const getStatusBannerGradient = (status) => {
  switch (status) {
    case 'OPEN': return 'from-amber-500/10 to-transparent';
    case 'IN_PROGRESS': return 'from-blue-500/10 to-transparent';
    case 'RESOLVED': return 'from-emerald-500/10 to-transparent';
    case 'CLOSED': return 'from-slate-500/10 to-transparent';
    case 'REJECTED': return 'from-rose-500/10 to-transparent';
    default: return 'from-emerald-500/10 to-transparent';
  }
};

const getStatusPillStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'CLOSED': return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-200';
    default: return 'bg-emerald-50 text-emerald-600 border-emerald-200';
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

const ModernInfoCard = ({ label, value, icon, highlightColor = "text-slate-900" }) => (
  <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-black truncate ${highlightColor}`}>
          {typeof value === 'string' ? value.replace('_', ' ') : value}
        </p>
      </div>
    </div>
  </div>
);

export default TicketDetailsPage;
