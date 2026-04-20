import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const TechnicianMessagesPage = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Admin - Sarah Chen', role: 'ADMIN', text: 'Hi Technician, we just received an emergency report about a water leak in Hostel Block B, 3rd floor bathroom. Can you prioritize this?', time: '10:42 AM', isMe: false },
    { id: 2, sender: 'Technician', role: 'TECH', text: 'Copy that, Sarah. I am just finishing up the AC maintenance in Science Lab. I will be at Hostel B in 15 minutes.', time: '10:45 AM', isMe: true }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate real-time updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const newMessage = {
        id: Date.now(),
        sender: 'Admin - Sarah Chen',
        role: 'ADMIN',
        text: 'Thanks for the quick response! Please update the ticket status once you arrive.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setMessages(prev => [...prev, newMessage]);
    }, 15000); // 15 seconds after load
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: user?.username || 'Technician',
      role: 'TECH',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Communication Center</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Chat with admins, supervisors, and review ticket announcements</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden flex">
        {/* Contacts Sidebar */}
        <div className="w-[350px] border-r border-slate-50 flex flex-col">
           <div className="p-6">
              <div className="relative">
                 <input type="text" placeholder="Search chats..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
                 <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto">
              {[
                 { name: 'Admin - Sarah Chen', msg: messages[messages.length-1].text, time: messages[messages.length-1].time, unread: true, role: 'ADMIN' },
                 { name: 'Supervisor - James Wilson', msg: 'Shift schedule for next week is out', time: 'Yesterday', unread: false, role: 'SUPERVISOR' },
                 { name: 'Announcement: Maintenance Pack', msg: 'New safety protocols updated...', time: 'Mon', unread: false, role: 'SYSTEM' },
                 { name: 'Admin - Kevin Wright', msg: 'Status on Ticket #425?', time: 'Mon', unread: false, role: 'ADMIN' }
              ].map((chat, i) => (
                 <div key={i} className={`px-6 py-5 flex gap-4 cursor-pointer hover:bg-slate-50 transition-all ${i === 0 ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shadow-sm flex-shrink-0 ${chat.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : chat.role === 'SUPERVISOR' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                       {chat.name.split(' ').pop().substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-0.5">
                          <p className="text-xs font-black text-slate-900 truncate">{chat.name}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase">{chat.time}</span>
                       </div>
                       <p className={`text-[11px] truncate ${chat.unread ? 'font-black text-slate-900' : 'font-medium text-slate-400'}`}>{chat.msg}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
           <div className="px-8 py-5 bg-white border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">SC</div>
                 <div>
                    <p className="text-sm font-black text-slate-900">Admin - Sarah Chen</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</p>
                 </div>
              </div>
           </div>

           <div className="flex-1 p-8 overflow-y-auto space-y-6 flex flex-col">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.isMe ? 'flex-row-reverse self-end ml-auto' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${msg.isMe ? 'bg-indigo-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
                    {msg.isMe ? 'T' : 'SC'}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm border ${msg.isMe ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] font-black uppercase mt-2 ${msg.isMe ? 'opacity-60' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
           </div>

           <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-50">
              <div className="flex gap-4">
                 <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner outline-none" 
                 />
                 <button 
                    type="submit"
                    className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                 >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default TechnicianMessagesPage;
