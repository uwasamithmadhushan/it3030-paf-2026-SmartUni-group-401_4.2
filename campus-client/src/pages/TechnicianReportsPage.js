import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TechnicianReportsPage = () => {
  const reportRef = useRef(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F8FAFC'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Technician_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    }
  };

  const handleExportExcel = () => {
    // Simple CSV Export as 'Excel' placeholder
    const data = [
      ['Metric', 'Value'],
      ['Jobs Completed', '142'],
      ['Avg Response', '18m'],
      ['Resolution Time', '3.5h'],
      ['Productivity', '94%']
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Technician_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Performance Reports</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Track your maintenance productivity and efficiency metrics</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
           >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export PDF
           </button>
           <button 
             onClick={handleExportExcel}
             className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
           >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export Excel
           </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ReportStatCard title="Jobs Completed" value="142" subValue="+12% from last month" color="indigo" />
         <ReportStatCard title="Avg Response" value="18m" subValue="-2m improvement" color="emerald" />
         <ReportStatCard title="Resolution Time" value="3.5h" subValue="Target met" color="blue" />
         <ReportStatCard title="Productivity Score" value="94%" subValue="Top 5% tier" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Resolution Chart (8 cols) */}
         <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
            <h3 className="text-sm font-black uppercase tracking-widest mb-10">Monthly Resolution Trend</h3>
            <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
               {/* Background grid lines */}
               <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none px-4">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 h-0"></div>)}
               </div>
               {[45, 60, 40, 85, 95, 70, 80, 55, 90, 100, 75, 85].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative z-10">
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h} tasks</div>
                     <div 
                        className={`w-full rounded-t-xl transition-all duration-700 cursor-pointer ${i === 9 ? 'bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-100'}`} 
                        style={{ height: `${h}%` }}
                     ></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Category Breakdown (4 cols) */}
         <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8">Category Distribution</h3>
            <div className="space-y-6">
               <CategoryRow label="AC Maintenance" value="35%" color="bg-indigo-500" />
               <CategoryRow label="IT & Networking" value="25%" color="bg-blue-500" />
               <CategoryRow label="Electrical" value="20%" color="bg-amber-500" />
               <CategoryRow label="Plumbing" value="15%" color="bg-emerald-500" />
               <CategoryRow label="Others" value="5%" color="bg-slate-300" />
            </div>
            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Most Frequent Site</p>
               <p className="text-sm font-black text-slate-900">Engineering Block B</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const ReportStatCard = ({ title, value, subValue, color }) => {
   const colorMap = {
      indigo: 'text-indigo-600',
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      amber: 'text-amber-600'
   };
   return (
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
         <p className={`text-2xl font-black ${colorMap[color]}`}>{value}</p>
         <p className="text-[10px] font-bold text-slate-400 mt-2">{subValue}</p>
      </div>
   );
};

const CategoryRow = ({ label, value, color }) => (
   <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-700">
         <span>{label}</span>
         <span className="text-slate-400">{value}</span>
      </div>
      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
         <div className={`h-full ${color}`} style={{ width: value }}></div>
      </div>
   </div>
);

export default TechnicianReportsPage;
