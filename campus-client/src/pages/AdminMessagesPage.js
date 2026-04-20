import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getAllTickets } from '../services/api';

const AdminMessagesPage = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [selectedContact, setSelectedContact] = useState(0);
  const [search, setSearch] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const messagesEndRef = useRef(null);

  // Seed conversations per contact index
  const [conversations, setConversations] = useState({
    0: [
      { id: 1, sender: 'Tech - Alex Rivera', role: 'TECH', text: 'Admin, the HVAC unit in Block C is completely non-functional. I will need a spare part ordered before I can proceed.', time: '09:15 AM', isMe: false },
      { id: 2, sender: 'Admin', role: 'ADMIN', text: 'Understood Alex. I have raised a purchase order for the part. It should arrive by Thursday. Keep the ticket open until then.', time: '09:22 AM', isMe: true },
    ],
    1: [
      { id: 1, sender: 'Tech - Jordan Lee', role: 'TECH', text: 'I have completed the network rewiring in the IT lab. All 30 ports are now active and tested.', time: '11:30 AM', isMe: false },
      { id: 2, sender: 'Admin', role: 'ADMIN', text: 'Great work Jordan. Please close the ticket and submit your completion report by end of day.', time: '11:45 AM', isMe: true },
    ],
    2: [
      { id: 1, sender: 'SYSTEM', role: 'SYSTEM', text: '📢 Scheduled maintenance window: All campus networks will be offline Saturday 2AM–4AM. Please update all open network tickets accordingly.', time: 'Mon', isMe: false },
    ],
    3: [
      { id: 1, sender: 'Tech - Sam Park', role: 'TECH', text: 'Hi Admin, I wanted to flag that there are 3 high-priority tickets in my queue but I am currently assigned to a CRITICAL one. Should I reassign?', time: 'Yesterday', isMe: false },
      { id: 2, sender: 'Admin', role: 'ADMIN', text: 'Yes, please reassign the two HIGH tickets to Kevin. I will notify him now.', time: 'Yesterday', isMe: true },
    ],
  });

  const contacts = [
    { name: 'Tech - Alex Rivera', role: 'TECH', status: 'Online', lastMsg: conversations[0]?.slice(-1)[0]?.text || '...', time: '09:22 AM', initials: 'AR' },
    { name: 'Tech - Jordan Lee', role: 'TECH', status: 'Away', lastMsg: conversations[1]?.slice(-1)[0]?.text || '...', time: '11:45 AM', initials: 'JL' },
    { name: 'Announcement Channel', role: 'SYSTEM', status: '', lastMsg: conversations[2]?.slice(-1)[0]?.text || '...', time: 'Mon', initials: 'PA' },
    { name: 'Tech - Sam Park', role: 'TECH', status: 'Offline', lastMsg: conversations[3]?.slice(-1)[0]?.text || '...', time: 'Yesterday', initials: 'SP' },
  ];

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, selectedContact]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: user?.username || 'Admin',
      role: 'ADMIN',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setConversations(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMsg],
    }));
    setInput('');
  };

  const activeContact = contacts[selectedContact];
  const activeMessages = conversations[selectedContact] || [];

  const roleColor = (role) => {
    if (role === 'TECH') return 'bg-emerald-100 text-emerald-700';
    if (role === 'SYSTEM') return 'bg-slate-100 text-slate-500';
    return 'bg-purple-100 text-purple-600';
  };

  const statusColor = (status) => {
    if (status === 'Online') return 'text-emerald-500';
    if (status === 'Away') return 'text-amber-500';
    return 'text-slate-400';
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 h-[calc(100vh-140px)] flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Communication Center</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            Coordinate with technicians, broadcast announcements, manage ticket updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
            ADMIN CHANNEL
          </div>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex min-h-0">

        {/* Contact List */}
        <div className="w-[340px] border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="p-5 border-b border-slate-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-400 transition-all outline-none"
              />
              <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredContacts.map((contact, i) => {
              const originalIndex = contacts.indexOf(contact);
              return (
                <div
                  key={i}
                  onClick={() => setSelectedContact(originalIndex)}
                  className={`px-5 py-4 flex gap-4 cursor-pointer transition-all border-b border-slate-50 ${originalIndex === selectedContact ? 'bg-emerald-50/60 border-r-4 border-r-emerald-500' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0 ${roleColor(contact.role)}`}>
                    {contact.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-xs font-black text-slate-900 truncate">{contact.name}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase ml-2 flex-shrink-0">{contact.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{contact.lastMsg}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-50/20 min-w-0">
          {/* Chat Header */}
          <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${roleColor(activeContact?.role)}`}>
                {activeContact?.initials}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{activeContact?.name}</p>
                {activeContact?.status && (
                  <p className={`text-[10px] font-black uppercase tracking-widest ${statusColor(activeContact.status)}`}>
                    {activeContact.status}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors" title="View linked tickets">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6 flex flex-col min-h-0">
            {activeMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[75%] ${msg.isMe ? 'flex-row-reverse self-end ml-auto' : 'self-start'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${msg.isMe ? 'bg-[#10B981] text-white' : roleColor(msg.role)}`}>
                  {msg.isMe ? (user?.username?.substring(0, 2).toUpperCase() || 'AD') : activeContact?.initials}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm border ${msg.isMe ? 'bg-[#10B981] text-white border-emerald-400 rounded-tr-none' : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[9px] font-black uppercase mt-2 ${msg.isMe ? 'opacity-60' : 'text-slate-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-400 transition-all shadow-inner outline-none"
              />
              <button
                type="submit"
                className="w-12 h-12 bg-[#10B981] text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
