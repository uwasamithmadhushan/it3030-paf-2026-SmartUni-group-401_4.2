import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getMyBookings, getAllTickets } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserDashboardPage() {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, bookingsRes, ticketsRes] = await Promise.all([
        getMe(),
        getMyBookings(),
        getAllTickets()
      ]);
      setUserData(userRes.data);
      setBookings(bookingsRes.data);
      setTickets(ticketsRes.data.filter(t => t.createdById === userRes.data.id));
    } catch (err) {
      console.error('Failed to load student hub');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Entering Student Hub..." />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-luxury">
      
      {/* Premium Hero Header */}
      <div className="relative p-10 lg:p-14 rounded-[3rem] overflow-hidden bg-gradient-to-br from-violet-deep to-wine-muted shadow-luxury">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-10 -translate-y-10">
          <svg width="400" height="400" viewBox="0 0 200 200">
            <path fill="#FBE4D8" d="M44.3,-76.4C58.1,-69.5,70.6,-58.4,79.1,-44.6C87.6,-30.8,92.1,-14.2,91.2,2.3C90.3,18.8,84.1,35.2,73.5,48.2C62.9,61.2,47.9,70.9,32.3,76.4C16.7,81.9,0.5,83.1,-15.7,81.1C-31.9,79.1,-48.1,73.9,-61.2,64C-74.3,54.1,-84.3,39.5,-88.1,23.5C-91.9,7.5,-89.5,-9.8,-83.4,-25.5C-77.3,-41.2,-67.5,-55.3,-54.3,-62.5C-41.1,-69.7,-24.5,-70.1,-8.3,-70.8C7.9,-71.5,24.1,-72.6,37.1,-75.7C50.1,-78.8,59.9,-83.9,44.3,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-ivory-warm/20">
               <span className="text-xl">✨</span>
            </div>
            <span className="text-xs font-black text-blush-soft uppercase tracking-[0.3em]">Welcome to Excellence</span>
          </div>
          <h1 className="text-5xl font-black text-ivory-warm tracking-tighter mb-4">Bonjour, {userData?.username}</h1>
          <p className="text-lg font-medium text-ivory-warm/70 max-w-xl mb-10 leading-relaxed">
            Your personal campus assistant. Manage your facilities and track your requests with ease and elegance.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/tickets/new')} className="luxury-button !bg-ivory-warm !text-plum-dark">
              New Incident Report
            </button>
            <button onClick={() => navigate('/facilities')} className="px-8 py-3 rounded-full bg-white/10 text-ivory-warm border border-ivory-warm/20 font-bold hover:bg-white/20 transition-all">
              Reserve Facility
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Support Requests */}
        <div className="lg:col-span-2 luxury-card !p-0 overflow-hidden">
          <div className="px-8 py-6 border-b border-ivory-warm/5 flex justify-between items-center bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-ivory-warm">Your Support Requests</h3>
            <span className="text-[10px] font-black text-blush-soft uppercase">{tickets.length} Reports</span>
          </div>
          <div className="divide-y divide-ivory-warm/5">
            {tickets.map(t => (
              <div key={t.id} className="px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>
                <div className="flex gap-4 items-center">
                  <div className={`w-2 h-2 rounded-full ${t.status === 'OPEN' ? 'bg-amber-400' : t.status === 'RESOLVED' ? 'bg-emerald-400' : 'bg-blush-soft'}`} />
                  <div>
                    <h4 className="text-sm font-bold text-ivory-warm group-hover:text-blush-soft transition-colors">{t.title}</h4>
                    <p className="text-[10px] text-ivory-warm/40 font-bold uppercase mt-1">{t.status.replace('_', ' ')} • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-ivory-warm/20 group-hover:text-ivory-warm transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="p-16 text-center text-ivory-warm/30 italic text-sm font-medium">No active reports. Everything is in order.</div>
            )}
          </div>
        </div>

        {/* Reservations Snapshot */}
        <div className="luxury-card flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-blush-soft mb-8">Upcoming Reservations</h3>
          <div className="flex-1 space-y-6">
            {bookings.length > 0 ? (
              bookings.slice(0, 3).map(b => (
                <div key={b.id} className="p-5 rounded-2xl bg-plum-dark/40 border border-ivory-warm/5 group hover:border-blush-soft/20 transition-all">
                  <p className="text-[10px] font-black text-blush-soft uppercase tracking-widest mb-1">{b.resourceName || 'Facility'}</p>
                  <p className="text-sm font-bold text-ivory-warm">{new Date(b.startTime).toLocaleDateString()} at {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-ivory-warm/20 flex items-center justify-center text-3xl mb-4">📅</div>
                <p className="text-xs font-medium text-ivory-warm italic">No upcoming bookings.</p>
              </div>
            )}
          </div>
          <button onClick={() => navigate('/facilities')} className="w-full py-4 mt-8 bg-white/5 border border-ivory-warm/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-ivory-warm hover:bg-white/10 transition-all">
            Browse Catalogue
          </button>
        </div>
      </div>

    </div>
  );
}
