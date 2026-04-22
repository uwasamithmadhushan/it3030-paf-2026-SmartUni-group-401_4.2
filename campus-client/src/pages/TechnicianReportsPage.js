import React, { useRef, useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getAllTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileDown, 
  RefreshCw, 
  BarChart3, 
  PieChart, 
  Activity, 
  ShieldCheck, 
  ChevronRight,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function TechnicianReportsPage() {
  const reportRef = useRef(null);
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await getAllTickets();
      const myTickets = data.filter(t => t.assignedTechnicianId === user?.id);
      setTickets(myTickets);
    } catch (error) {
      console.error('Failed to synchronize report intelligence');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const completed = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'COMPLETED');
    
    const categories = {};
    tickets.forEach(t => {
      const cat = t.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    const total = tickets.length || 1;
    const catDist = Object.entries(categories).map(([label, count]) => ({
      label,
      value: `${Math.round((count / total) * 100)}%`,
      count
    })).sort((a, b) => b.count - a.count);

    return {
      completedCount: completed.length,
      totalCount: tickets.length,
      catDist,
      productivity: tickets.length > 0 ? Math.round((completed.length / tickets.length) * 100) : 0
    };
  }, [tickets]);

  if (loading && tickets.length === 0) return <LoadingSpinner fullScreen message="Synthesizing Maintenance Intelligence..." />;

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#011C40'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Technician_Intelligence_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Performance Intelligence</span>
              </div>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter">Maintenance <span className="text-luna-aqua">Analytics</span></h1>
           <p className="text-text-muted font-medium mt-2">Executive oversight of technical productivity and resolution cycles.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={handleExportPDF}
             className="luna-button !px-8 flex items-center gap-3 shadow-lg shadow-luna-aqua/20"
           >
              <FileDown size={18} />
              <span>Export Dossier</span>
           </button>
           <button onClick={() => fetchData()} className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all">
              <RefreshCw size={20} />
           </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-12">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <ReportStatCard 
             icon={<CheckCircle2 size={24} />} 
             title="Deployments Resolved" 
             value={stats.completedCount} 
             subValue={`${stats.totalCount} Total Assignments`} 
             color="luna-aqua" 
           />
           <ReportStatCard 
             icon={<Clock size={24} />} 
             title="Avg. Sync Time" 
             value="18m" 
             subValue="3m improvement" 
             color="luna-cyan" 
           />
           <ReportStatCard 
             icon={<Activity size={24} />} 
             title="Cycle Velocity" 
             value="3.5h" 
             subValue="Optimal state" 
             color="luna-steel" 
           />
           <ReportStatCard 
             icon={<TrendingUp size={24} />} 
             title="Productivity Score" 
             value={`${stats.productivity}%`} 
             subValue="Real-time calculation" 
             color="white" 
           />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
           {/* Chart Panel */}
           <div className="xl:col-span-8 luna-card">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <BarChart3 size={16} className="text-luna-aqua" /> Monthly Resolution Trend
                </h3>
              </div>
              <div className="h-72 flex items-end justify-between gap-3 px-6 relative">
                 <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none px-6">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-luna-aqua h-0"></div>)}
                 </div>
                 {[45, 60, 40, 85, 95, 70, 80, 55, 90, 100, 75, 85].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative z-10">
                       <div 
                          className={`w-full rounded-t-2xl transition-all duration-700 cursor-pointer ${i === 9 ? 'bg-luna-aqua luna-glow' : 'bg-luna-steel/20 hover:bg-luna-aqua/40'}`} 
                          style={{ height: `${h}%` }}
                       ></div>
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Distribution Panel */}
           <div className="xl:col-span-4 luna-card">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <PieChart size={16} className="text-luna-aqua" /> Sector Distribution
              </h3>
              <div className="space-y-8">
                 {stats.catDist.map((cat, i) => (
                    <CategoryRow 
                      key={i} 
                      label={cat.label} 
                      value={cat.value} 
                      color={['bg-luna-aqua', 'bg-luna-cyan', 'bg-luna-steel', 'bg-white', 'bg-luna-steel/40'][i % 5]} 
                    />
                 ))}
                 {stats.catDist.length === 0 && (
                   <div className="py-20 text-center opacity-20 italic">
                      <Layers size={40} className="mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Sector Data</p>
                   </div>
                 )}
              </div>
              <div className="mt-12 p-6 luna-glass rounded-3xl border border-luna-aqua/10">
                 <p className="text-[10px] font-black text-luna-cyan uppercase tracking-widest mb-1">Archive Status</p>
                 <p className="text-sm font-black text-white">Cloud Archive Synchronized</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const ReportStatCard = ({ icon, title, value, subValue, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="luna-card group hover:border-luna-aqua/30"
  >
     <div className={`w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-${color} mb-6 group-hover:luna-glow transition-all`}>
        {icon}
     </div>
     <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{title}</p>
     <p className={`text-3xl font-black text-white`}>{value}</p>
     <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-widest border-t border-luna-aqua/5 pt-3">{subValue}</p>
  </motion.div>
);

const CategoryRow = ({ label, value, color }) => (
   <div className="space-y-3">
      <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
         <span className="text-white">{label}</span>
         <span className="text-luna-cyan">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-luna-steel/10 rounded-full overflow-hidden">
         <motion.div 
            initial={{ width: 0 }}
            animate={{ width: value }}
            className={`h-full ${color} luna-glow`}
         />
      </div>
   </div>
);
