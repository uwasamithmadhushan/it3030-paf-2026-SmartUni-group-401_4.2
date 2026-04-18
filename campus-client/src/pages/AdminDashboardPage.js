import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, getAllUsers } from '../services/api';
import MainLayout from '../components/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, usersRes] = await Promise.all([
          getAllTickets(),
          getAllUsers()
        ]);
        setTickets(ticketsRes.data);
        setTechnicians(usersRes.data.filter(u => u.role === 'TECHNICIAN'));
      } catch (err) {
        console.error('Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
    rejected: tickets.filter(t => t.status === 'REJECTED').length,
  };

  const workload = technicians.map(tech => ({
    name: tech.username,
    count: tickets.filter(t => t.assignedTechnicianId === tech.id).length
  })).sort((a, b) => b.count - a.count);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Admin Support Monitor</h1>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Tickets" value={stats.total} color="indigo" />
          <StatCard title="Open / New" value={stats.open} color="blue" />
          <StatCard title="Closed" value={stats.closed} color="slate" />
          <StatCard title="Rejected" value={stats.rejected} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Technician Workload */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Technician Workload</h3>
            </div>
            <div className="p-8 space-y-6">
              {workload.map((tech, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700">{tech.name}</span>
                    <span className="font-black text-indigo-600">{tech.count} active</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((tech.count / (stats.total || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {workload.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No technicians found</p>}
            </div>
          </div>

          {/* Recent Global Activity */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Global Activity Stream</h3>
              <button onClick={() => navigate('/tickets')} className="text-[10px] font-black text-indigo-600 uppercase">Manage All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {tickets.slice(0, 5).map((ticket, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{ticket.title}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${getStatusStyles(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
                </div>
              ))}
              {tickets.length === 0 && <p className="text-center text-slate-400 text-sm py-12">No tickets logged in system</p>}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className={`text-4xl font-black text-${color}-600 tracking-tighter`}>{value}</p>
  </div>
);

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-50 text-blue-600';
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600';
    case 'RESOLVED': return 'bg-emerald-50 text-emerald-600';
    case 'REJECTED': return 'bg-rose-50 text-rose-600';
    default: return 'bg-slate-50 text-slate-500';
  }
};

export default AdminDashboardPage;
