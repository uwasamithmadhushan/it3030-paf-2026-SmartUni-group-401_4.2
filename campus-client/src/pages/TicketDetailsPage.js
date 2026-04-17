import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, assignTechnician, updateTicketStatus, getAllUsers } from '../services/api';
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
      message: `Move this ticket to ${newStatus.replace('_', ' ')}?`,
      data: newStatus
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
          note: `Status explicitly updated to ${modalState.data} by ${user.username}` 
        });
        addToast(`Ticket status updated to ${modalState.data}`, 'success');
      }
      fetchData();
    } catch (error) {
      addToast('Requested action failed. Please try again.', 'error');
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-10 group">
        <button 
          onClick={() => navigate('/tickets')} 
          className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ticket Details</h1>
          <p className="text-xs font-mono text-gray-400 mt-0.5">Reference ID: {ticket.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
             {/* Status Banner */}
             <div className={`absolute top-0 right-0 left-0 h-1.5 ${getStatusIndicator(ticket.status)}`}></div>
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${getStatusStyles(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Created At</p>
                    <p className="text-xs font-bold text-gray-700">{new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
             </div>

             <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">{ticket.title}</h2>
             <p className="text-gray-600 text-lg leading-relaxed mb-10 whitespace-pre-wrap bg-gray-50/30 p-6 rounded-3xl border border-gray-50/50 italic">
               "{ticket.description}"
             </p>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-gray-50/30 rounded-3xl border border-gray-50">
                <DetailItem label="Category" value={ticket.category.replace('_', ' ')} />
                <DetailItem 
                  label="Priority" 
                  value={ticket.priority} 
                  valueClass={`font-black tracking-tighter ${getPriorityColor(ticket.priority)}`} 
                />
                <DetailItem label="Reporter" value={ticket.createdByUsername || 'Anonymous'} isUser />
             </div>
          </div>

          <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-gray-100 border border-gray-50">
            <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-3">
              <span className="bg-indigo-50 p-2 rounded-xl">🕒</span>
              Activity Timeline
            </h3>
            <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-50">
              {ticket.updates && ticket.updates.length > 0 ? (
                ticket.updates.map((update, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm z-10"></div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Update #{idx + 1}</span>
                        <span className="text-xs font-bold text-gray-400">{new Date(update.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-50 hover:border-indigo-100 transition-colors">
                        <p className="text-gray-900 font-bold mb-1">{update.statusUpdate || 'Technician Update'}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{update.note || 'No detailed notes provided.'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 font-medium italic py-4">No activity logged yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100 border border-gray-50">
              <h3 className="font-black text-lg text-gray-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                Action Center
              </h3>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-4">Assigned Expert</label>
                  <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
                      {ticket.assignedTechnicianName ? ticket.assignedTechnicianName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <span className="font-black text-gray-900 block">{ticket.assignedTechnicianName || 'Pending Assignment'}</span>
                      <span className="text-xs font-bold text-indigo-400">{ticket.assignedTechnicianName ? 'Staff Specialist' : 'Waiting for Staff'}</span>
                    </div>
                  </div>
                </div>

                {user.role === 'ADMIN' && (
                  <div className="pt-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-4">Reassign Task</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <select 
                          value={selectedTech}
                          onChange={(e) => setSelectedTech(e.target.value)}
                          className="w-full pl-6 pr-12 py-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-0 focus:border-indigo-500 transition-all"
                        >
                          <option value="">Select Technician</option>
                          {technicians.map(t => (
                            <option key={t.id} value={t.id}>{t.username}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <button 
                        onClick={handleAssignAction}
                        disabled={!selectedTech}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-30 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        Assign Task
                      </button>
                    </div>
                  </div>
                )}

                {(user.role === 'ADMIN' || (user.role === 'TECHNICIAN' && ticket.assignedTechnicianId === user.id)) && (
                  <div className="pt-6 border-t border-gray-50">
                     <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-4">Status Directives</label>
                     <div className="grid grid-cols-1 gap-3">
                       {ticket.status === 'OPEN' && (
                         <button 
                           onClick={() => handleStatusAction('IN_PROGRESS')}
                           className="w-full py-4 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-yellow-100 transition-all active:scale-95"
                         >
                           Start Working
                         </button>
                       )}
                       {ticket.status === 'IN_PROGRESS' && (
                         <button 
                           onClick={() => handleStatusAction('RESOLVED')}
                           className="w-full py-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-100 transition-all active:scale-95"
                         >
                           Resolve Issue
                         </button>
                       )}
                       {ticket.status !== 'CLOSED' && (
                         <button 
                           onClick={() => handleStatusAction('CLOSED')}
                           className="w-full py-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                         >
                           Close Permanently
                         </button>
                       )}
                     </div>
                  </div>
                )}
              </div>
           </div>
           
           <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100 border border-gray-50">
             <h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
               📁 Attachments
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
                          className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all truncate"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl overflow-hidden shadow-sm">
                            {isImg ? <img src={file.url} alt="thumb" className="w-full h-full object-cover" /> : '📄'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-700 block truncate">{file.filename}</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase">{file.fileType || 'File'}</span>
                          </div>
                        </a>
                      </div>
                   );
                 })
               ) : (
                 <div className="text-center py-6 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-300 text-sm font-bold">
                   No relevant files found
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
        type={modalState.type === 'assign' || modalState.data === 'RESOLVED' ? 'info' : 'danger'}
        confirmText={modalState.type === 'assign' ? 'Assign Now' : 'Update Now'}
      />
    </div>
  );
};

const DetailItem = ({ label, value, valueClass = "font-black text-gray-900", isUser = false }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
    <div className="flex items-center gap-2">
      {isUser && <div className="w-5 h-5 rounded bg-indigo-100 text-[10px] flex items-center justify-center border border-indigo-200">👤</div>}
      <p className={`text-base truncate ${valueClass}`}>{value.replace('_', ' ')}</p>
    </div>
  </div>
);

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'IN_PROGRESS': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
    case 'CLOSED': return 'bg-gray-100 text-gray-400 border-gray-100';
    default: return 'bg-gray-50 text-gray-500';
  }
};

const getStatusIndicator = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-500';
    case 'IN_PROGRESS': return 'bg-yellow-400';
    case 'RESOLVED': return 'bg-green-500';
    case 'CLOSED': return 'bg-gray-200';
    default: return 'bg-gray-100';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'text-red-600';
    case 'HIGH': return 'text-orange-600';
    case 'MEDIUM': return 'text-yellow-600';
    case 'LOW': return 'text-green-600';
    default: return 'text-gray-400';
  }
};

export default TicketDetailsPage;
