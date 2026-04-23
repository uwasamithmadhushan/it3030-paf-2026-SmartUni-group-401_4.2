import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const ChartsSection = ({ stats }) => {
  const COLORS = ['#A7EBF2', '#22d3ee', '#818cf8', '#f472b6', '#fbbf24', '#ef4444'];

  const statusData = Object.entries(stats?.ticketsByStatus || {}).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(stats?.ticketsByPriority || {}).map(([name, value]) => ({ name, value }));
  
  const weeklyData = Object.entries(stats?.weeklyCompletedTickets || {}).map(([date, count]) => ({
    name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    tickets: count
  }));

  // Dummy monthly trend data for visualization if not in stats
  const monthlyData = [
    { name: 'Jan', value: 40 }, { name: 'Feb', value: 65 }, { name: 'Mar', value: 45 },
    { name: 'Apr', value: 90 }, { name: 'May', value: 120 }, { name: 'Jun', value: 85 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Workload Bar Chart */}
      <div className="luna-card">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" /> Weekly Deployment Pulse
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(167,235,242,0.05)'}}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(167,235,242,0.2)', borderRadius: '1rem' }}
              />
              <Bar dataKey="tickets" fill="#A7EBF2" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="luna-card">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-luna-cyan animate-pulse" /> Operational Growth Trend
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(167,235,242,0.2)', borderRadius: '1rem' }}
              />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Donut Chart */}
      <div className="luna-card">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Criticality Breakdown
        </h3>
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(167,235,242,0.2)', borderRadius: '1rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Pie Chart */}
      <div className="luna-card">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Life Cycle Distribution
        </h3>
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(167,235,242,0.2)', borderRadius: '1rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChartsSection);
