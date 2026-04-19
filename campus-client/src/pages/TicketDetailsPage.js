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

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(id, commentId);
      addToast('Comment deleted', 'success');
      fetchData(true);
    } catch (error) {
      addToast('Failed to delete comment', 'error');
    }
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
    setLoading(true);
    try {
      await uploadAttachment(id, file);
      fetchData(true);
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tickets')} 
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ticket #{ticket.id.substring(0, 8)}</h1>
            <p className="text-sm text-slate-500">View and manage incident details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area (Left Column - spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Primary Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 overflow-hidden relative">
            <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${getStatusBannerGradient(ticket.status)}`}></div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusStyles(ticket.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusDotColor(ticket.status)}`}></span>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Logged: {new Date(ticket.createdAt).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">{ticket.title}</h2>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {ticket.description}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <DetailItem label="Category" value={ticket.category} />
              <DetailItem label="Location" value={ticket.location || 'N/A'} />
              <DetailItem label="Contact" value={ticket.contactDetails || 'N/A'} />
              <DetailItem 
                label="Priority" 
                value={ticket.priority} 
                valueClass={`font-bold ${getPriorityColor(ticket.priority)}`} 
              />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-6 pt-6 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reporter</span>
                <span className="text-sm font-bold text-slate-900">{ticket.createdByUsername || 'System User'}</span>
              </div>
              {ticket.resourceId && (
                <div className="flex flex-col gap-1 border-l border-slate-200 pl-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Related Asset</span>
                  <span className="text-sm font-bold text-[#5B5CE6]">{ticket.resourceId.substring(0,8)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Discussion Thread */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Discussion Thread</h3>
            
            <div className="space-y-6 mb-8">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, i) => {
                  const isMyComment = comment.userId === user.id;
                  return (
                    <div key={i} className={`flex gap-4 items-start group ${isMyComment ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isMyComment ? 'bg-[#5B5CE6] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={`relative max-w-[85%] p-4 rounded-2xl border ${isMyComment ? 'bg-indigo-50 border-indigo-100 rounded-tr-sm' : 'bg-slate-50 border-slate-100 rounded-tl-sm'}`}>
                        <div className={`flex justify-between items-center mb-2 gap-4 ${isMyComment ? 'flex-row-reverse' : ''}`}>
                          <span className={`text-xs font-bold ${isMyComment ? 'text-indigo-900' : 'text-slate-900'}`}>{comment.username}</span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(comment.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className={`text-sm ${isMyComment ? 'text-indigo-900 text-right' : 'text-slate-700'}`}>{comment.text}</p>
                        
                        {(user.role === 'ADMIN' || isMyComment) && (
                          <div className={`absolute -top-3 ${isMyComment ? '-left-3' : '-right-3'} flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-sm border border-slate-200 rounded-full p-0.5`}>
                            {isMyComment && (
                              <button 
                                onClick={() => handleEditCommentAction(comment)}
                                className="w-6 h-6 text-slate-400 rounded-full flex items-center justify-center hover:text-[#5B5CE6] hover:bg-indigo-50 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
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
              <div className="bg-white rounded-xl border border-slate-200 focus-within:border-[#5B5CE6] overflow-hidden transition-colors shadow-sm">
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
                    className="px-6 py-2 bg-[#5B5CE6] text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors ml-auto"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Right Sidebar (Action Center & Meta) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Action Center */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Action Center</h3>
            
            <div className="space-y-6">
              {/* Assignment */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Assigned To</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm">
                    {ticket.assignedTechnicianName ? ticket.assignedTechnicianName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{ticket.assignedTechnicianName || 'Unassigned'}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{ticket.assignedTechnicianName ? 'Technician' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Admin Reassign */}
              {user.role === 'ADMIN' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Reassign Staff</label>
                  <div className="space-y-2">
                    <select 
                      value={selectedTech}
                      onChange={(e) => setSelectedTech(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-[#5B5CE6] outline-none"
                    >
                      <option value="">Select Technician...</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.username}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAssignAction}
                      disabled={!selectedTech || selectedTech === ticket.assignedTechnicianId}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        !selectedTech 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : selectedTech === ticket.assignedTechnicianId
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-[#5B5CE6] text-white hover:bg-indigo-700 active:scale-95'
                      }`}
                    >
                      {selectedTech === ticket.assignedTechnicianId ? '✓ Technician Assigned' : ticket.assignedTechnicianId ? 'Confirm Reassignment' : 'Confirm Assignment'}
                    </button>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              {(user.role === 'ADMIN' || (user.role === 'TECHNICIAN' && ticket.assignedTechnicianId === user.id)) && (
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Update Status</label>
                  <div className="space-y-2">
                    {ticket.status === 'OPEN' && (
                      <button onClick={() => handleStatusAction('IN_PROGRESS')} className="w-full py-2.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors">
                        Start Progress
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleStatusAction('RESOLVED')} className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">
                        Mark Resolved
                      </button>
                    )}
                    {user.role === 'ADMIN' && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                      <button onClick={() => handleStatusAction('REJECTED')} className="w-full py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">
                        Reject Ticket
                      </button>
                    )}
                    {ticket.status !== 'CLOSED' && (
                      <button onClick={() => handleStatusAction('CLOSED')} className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Delete */}
              {(user.role === 'ADMIN' || ticket.createdById === user.id) && (
                <div className="pt-2 text-center">
                  <button 
                    onClick={handleDeleteAction}
                    className="py-2 text-red-600 text-xs font-bold hover:underline"
                  >
                    Delete Ticket
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900">Attachments</h3>
              {(user.role === 'ADMIN' || ticket.createdById === user.id) && ticket.attachments?.length < 3 && (
                <label className="cursor-pointer text-[#5B5CE6] hover:text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  + Add File
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                </label>
              )}
            </div>
            
            <div className="space-y-3">
              {ticket.attachments && ticket.attachments.length > 0 ? (
                ticket.attachments.map((file, i) => {
                  const isImg = file.url.match(/\.(jpeg|jpg|gif|png)$/) != null;
                  return (
                    <div key={i} className="group relative flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {isImg ? <img src={file.url} alt="thumb" className="w-full h-full object-cover" /> : '📄'}
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
                    <div className="absolute -left-[18.5px] top-1.5 w-2 h-2 rounded-full border border-white bg-[#5B5CE6]"></div>
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
        type={modalState.type === 'assign' || modalState.data === 'RESOLVED' ? 'info' : 'danger'}
        confirmText={modalState.type === 'assign' ? 'Assign' : 'Confirm'}
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
    case 'OPEN': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'CLOSED': return 'bg-slate-100 text-slate-600 border border-slate-200';
    case 'REJECTED': return 'bg-rose-50 text-rose-700 border border-rose-200';
    default: return 'bg-slate-50 text-slate-500 border border-slate-200';
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
    case 'OPEN': return 'from-blue-400 to-blue-500';
    case 'IN_PROGRESS': return 'from-amber-400 to-amber-500';
    case 'RESOLVED': return 'from-emerald-400 to-green-500';
    case 'CLOSED': return 'from-slate-300 to-slate-400';
    case 'REJECTED': return 'from-rose-400 to-red-500';
    default: return 'from-indigo-400 to-[#5B5CE6]';
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
