import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentTickets = ({ tickets }) => {
  const navigate = useNavigate();

  return (
    <div className="luna-card !p-0 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-luna-aqua" /> Deployment Directory
        </h3>
        <button 
          onClick={() => navigate('/assignments')}
          className="text-[10px] font-black uppercase tracking-widest text-luna-aqua hover:underline flex items-center gap-2"
        >
          View Full Archive <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/2">
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">Identifier</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">Objective</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">Priority</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">Status</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tickets.length > 0 ? tickets.map((t, i) => (
              <tr key={t.id} className="group hover:bg-luna-aqua/5 transition-all">
                <td className="px-8 py-6 text-[10px] font-bold text-white font-mono opacity-40">#{t.id.substring(0, 8)}</td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-white group-hover:text-luna-aqua transition-colors">{t.title}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg border ${
                    t.priority === 'URGENT' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-text-muted border-white/10'
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      t.status === 'IN_PROGRESS' ? 'bg-luna-cyan animate-pulse' : 'bg-luna-steel'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{t.status.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover:bg-luna-aqua group-hover:text-luna-midnight transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-20 italic">No Active Deployments Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(RecentTickets);
