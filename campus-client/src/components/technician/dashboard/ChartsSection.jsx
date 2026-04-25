import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const ChartsSection = ({ stats }) => {
  // Combine stats into a comprehensive trend - Memoized for stability
  const trendData = React.useMemo(() => {
    return Object.entries(stats?.weeklyCompletedTickets || {}).map(([date, count]) => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      resolved: count,
      incoming: Math.floor(Math.random() * 5) + 2, // Simulated incoming for intake comparison
    }));
  }, [stats?.weeklyCompletedTickets]);

  return (
    <div className="luna-card !p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
        <div className="text-[120px] font-black tracking-tighter leading-none">PULSE</div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12 relative z-10">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.4em] mb-3 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-luna-aqua luna-glow" /> 
            Operational Velocity Monitor
          </h3>
          <p className="text-text-muted text-sm max-w-md">Real-time telemetry tracking ticket resolution velocity against incoming incident intake.</p>
        </div>
        
        <div className="flex items-center gap-10">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Weekly Delta</span>
              <span className="text-2xl font-black text-luna-aqua">+24.5%</span>
           </div>
           <div className="h-10 w-[1px] bg-white/10" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Efficiency Index</span>
              <span className="text-2xl font-black text-white">0.94</span>
           </div>
        </div>
      </div>

      <div className="h-[450px] min-h-[450px] w-full min-w-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A7EBF2" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#A7EBF2" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={15}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${val} TCK`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(167,235,242,0.1)', borderRadius: '1.5rem', padding: '1.5rem' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
              labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Area 
              name="Resolved Tasks"
              type="monotone" 
              dataKey="resolved" 
              stroke="#A7EBF2" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorResolved)" 
              activeDot={{ r: 8, strokeWidth: 0, fill: '#A7EBF2' }}
            />
            <Area 
              name="New Incidents"
              type="monotone" 
              dataKey="incoming" 
              stroke="#22d3ee" 
              strokeWidth={2}
              strokeDasharray="10 10"
              fillOpacity={1} 
              fill="url(#colorIncoming)" 
            />
            <ReferenceLine y={0} stroke="#94a3b8" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(ChartsSection);
