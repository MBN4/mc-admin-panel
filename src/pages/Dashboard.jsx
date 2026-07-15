import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Clock,
  Zap,
  PackageCheck,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useAdminStore } from '../store/useAdminStore';
import MagnificentLoader from '../components/MagnificentLoader';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div whileHover={{ y: -5 }} className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -mr-8 -mt-8 ${color}`} />
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/10 text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-black transition-all duration-500">
        <Icon size={24} />
      </div>
    </div>
    <div>
      <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-4xl font-black tracking-tighter text-[var(--text-primary)]">{value}</h3>
    </div>
  </motion.div>
);

const POLL_INTERVAL_MS = 10000;

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="glass-card px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border border-[#FFD700]/30 shadow-2xl whitespace-nowrap"
    >
      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
        {new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </p>
      <p className="text-base sm:text-lg font-black text-[#FFD700]">Rs. {Number(payload[0].value).toLocaleString()}</p>
    </motion.div>
  );
};

const LiveRevenueDot = (props) => {
  const { cx, cy, index, dataLength } = props;
  if (cx == null || cy == null || index !== dataLength - 1) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill="#FFD700" opacity={0.25}>
        <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={5} fill="#FFD700" stroke="#000" strokeWidth={2} />
    </g>
  );
};

const HoverRevenueDot = (props) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={cx} cy={cy} r={11} fill="#FFD700" opacity={0.18} />
      <circle cx={cx} cy={cy} r={6} fill="#FFD700" stroke="#000" strokeWidth={2.5} />
    </g>
  );
};

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, theme } = useAdminStore();
  const [stats, setStats] = useState({ totalOrders: 0, totalUsers: 0, pendingOrders: 0, totalRevenue: 0 });
  const [analytics, setAnalytics] = useState({ revenueData: [], qualityData: [], statusData: [] });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [activeIndex, setActiveIndex] = useState(null);
  const [statusActive, setStatusActive] = useState(null);
  // Charts animate on the first render only. The 10s background poll replaces the
  // data arrays, and if animation stayed on, every poll re-ran the full draw-in —
  // that's the "glitchy" flicker. After the first paint we freeze animation so
  // subsequent poll updates morph in place smoothly.
  const [chartsAnimated, setChartsAnimated] = useState(false);
  const isMobile = useIsMobile();

  const fetchData = async ({ silent = false } = {}) => {
    if (!silent) setIsSyncing(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      const parsedAnalytics = {
        revenueData: (analyticsRes.data.revenueData || []).map(r => ({ ...r, revenue: Number(r.revenue) })),
        qualityData: (analyticsRes.data.qualityData || []).map(q => ({ ...q, count: Number(q.count) })),
        statusData: (analyticsRes.data.statusData || []).map(s => ({ ...s, count: Number(s.count) }))
      };
      setAnalytics(parsedAnalytics);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setIsSyncing(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const poll = setInterval(() => fetchData({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [token]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!isInitialLoading && !chartsAnimated) {
      const t = setTimeout(() => setChartsAnimated(true), 1300);
      return () => clearTimeout(t);
    }
  }, [isInitialLoading, chartsAnimated]);

  const PIE_COLORS = ['#FFD700', '#FBC02D', '#FFA000', '#FF8F00'];
  const chartText = theme === 'dark' ? '#6B7280' : '#4B5563';

  const revenueSeries = analytics.revenueData;
  const totalPeriodRevenue = revenueSeries.reduce((sum, r) => sum + r.revenue, 0);
  const lastDayRevenue = revenueSeries[revenueSeries.length - 1]?.revenue || 0;
  const prevDayRevenue = revenueSeries[revenueSeries.length - 2]?.revenue || 0;
  const dayDeltaPct = prevDayRevenue === 0
    ? (lastDayRevenue > 0 ? 100 : 0)
    : ((lastDayRevenue - prevDayRevenue) / prevDayRevenue) * 100;
  const isTrendingUp = dayDeltaPct >= 0;

  const secondsSinceUpdate = lastUpdated ? Math.max(0, Math.round((now - lastUpdated) / 1000)) : null;
  const liveLabel = secondsSinceUpdate === null ? 'Connecting…' : secondsSinceUpdate < 3 ? 'Just now' : `${secondsSinceUpdate}s ago`;

  const hoveredPoint = activeIndex != null ? revenueSeries[activeIndex] : null;
  const headerLabel = hoveredPoint
    ? new Date(hoveredPoint.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'This Month';
  const headerValue = hoveredPoint ? hoveredPoint.revenue : totalPeriodRevenue;

  const handleChartMove = (state) => {
    if (state?.isTooltipActive && state.activeTooltipIndex != null) {
      setActiveIndex(state.activeTooltipIndex);
    } else {
      setActiveIndex(null);
    }
  };
  const handleChartLeave = () => setActiveIndex(null);

  return (
    <div className="space-y-12">
      {isInitialLoading && <MagnificentLoader />}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-[#FFD700] font-black text-xs uppercase tracking-[0.4em]">Intelligence Overview</motion.p>
            <div className="flex items-center gap-1.5 text-green-500 text-[8px] font-black uppercase tracking-widest">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 ${isSyncing ? 'animate-ping' : ''}`} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              Live <Zap size={8} className={isSyncing ? 'animate-pulse' : ''} /> {liveLabel}
            </div>
          </div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-5xl lg:text-6xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Dashboard</motion.h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`Rs. ${stats.totalRevenue}`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Customers" value={stats.totalUsers} icon={Users} color="bg-[#FFD700]" />
        <StatCard title="Pending" value={stats.pendingOrders} icon={Clock} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.004 }}
          transition={{ duration: 0.4 }}
          className="xl:col-span-2 glass-card rounded-[3rem] p-6 sm:p-10 min-h-[450px] relative overflow-hidden"
        >
          <motion.div
            className="absolute -top-16 -left-16 w-56 h-56 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8 sm:mb-10 relative z-10">
            <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-[var(--text-primary)]"><BarChart3 className="text-[#FFD700]" /> Revenue Trend</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hoveredPoint ? hoveredPoint.date : 'total'}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="text-right"
                >
                  <p className="text-sm font-black text-[#FFD700]">Rs. {headerValue.toLocaleString()}</p>
                  <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{headerLabel}</p>
                </motion.div>
              </AnimatePresence>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black transition-colors ${isTrendingUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {isTrendingUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(dayDeltaPct).toFixed(0)}%
              </div>
              <p className="hidden sm:block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Last 30 Days • Delivered</p>
            </div>
          </div>
          <div className="h-[220px] sm:h-[280px] lg:h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.revenueData}
                margin={{ top: 20, right: isMobile ? 0 : 10, left: 0, bottom: 0 }}
                onMouseMove={handleChartMove}
                onMouseLeave={handleChartLeave}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke={chartText} fontSize={isMobile ? 9 : 10} tickLine={false} axisLine={false} interval={isMobile ? 6 : 3} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} />
                <YAxis stroke={chartText} fontSize={isMobile ? 9 : 10} width={isMobile ? 34 : 45} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val}`} />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#FFD700', strokeWidth: 1, strokeDasharray: '4 4' }} animationDuration={150} allowEscapeViewBox={{ x: false, y: false }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FFD700"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  isAnimationActive={!chartsAnimated}
                  animationDuration={900}
                  animationEasing="ease-out"
                  dot={(props) => <LiveRevenueDot {...props} dataLength={analytics.revenueData.length} />}
                  activeDot={<HoverRevenueDot />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="glass-card rounded-[3rem] p-10 min-h-[450px]">
          <h2 className="text-2xl font-black tracking-tighter uppercase mb-10 flex items-center gap-3 text-[var(--text-primary)]"><PieChartIcon className="text-[#FFD700]" /> Order Status</h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={analytics.statusData.length > 1 ? 4 : 0}
                  cornerRadius={6}
                  dataKey="count"
                  nameKey="status"
                  isAnimationActive={!chartsAnimated}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setStatusActive(index)}
                  onMouseLeave={() => setStatusActive(null)}
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="none"
                      opacity={statusActive === null || statusActive === index ? 1 : 0.3}
                      style={{ transition: 'opacity 0.25s ease, transform 0.25s ease', transformOrigin: 'center', transform: statusActive === index ? 'scale(1.04)' : 'scale(1)', cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={statusActive === null ? 'total' : `s-${statusActive}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-3xl font-black text-[var(--text-primary)]">
                    {statusActive === null ? stats.totalOrders : analytics.statusData[statusActive]?.count}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1">
                    {statusActive === null ? 'Total Orders' : analytics.statusData[statusActive]?.status}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-8 space-y-3">
             {analytics.statusData.map((s, i) => (
               <div
                 key={i}
                 onMouseEnter={() => setStatusActive(i)}
                 onMouseLeave={() => setStatusActive(null)}
                 className={`flex justify-between items-center px-5 py-3 rounded-2xl border cursor-pointer transition-all duration-200 ${statusActive === i ? 'bg-[#FFD700]/10 border-[#FFD700]/30 scale-[1.02]' : 'bg-[var(--input-bg)] border-[var(--border)]'}`}
               >
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">{s.status}</span>
                 </div>
                 <span className="text-xs font-black text-[var(--text-primary)]">{s.count}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
        <div className="glass-card rounded-[3rem] p-10 min-h-[400px]">
          <h2 className="text-2xl font-black tracking-tighter uppercase text-[var(--text-primary)] mb-10">Top Selling Fabrics</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.qualityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="quality" type="category" stroke={chartText} fontSize={10} width={100} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,215,0,0.06)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '15px', fontWeight: 700 }} />
                <Bar dataKey="count" fill="#FFD700" radius={[0, 10, 10, 0]} barSize={15} isAnimationActive={!chartsAnimated} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-[3rem] p-10 gold-gradient">
          <h2 className="text-2xl font-black tracking-tighter uppercase mb-8 text-black">Control Center</h2>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => navigate('/orders')} className="bg-black/10 backdrop-blur-md p-6 rounded-[2rem] text-black font-black uppercase text-xs tracking-widest flex flex-col items-center gap-3 hover:bg-black/20 transition-all border border-black/5">
                <ShoppingBag size={24} /> Process Orders
             </button>
             <button onClick={() => navigate('/qualities')} className="bg-black/10 backdrop-blur-md p-6 rounded-[2rem] text-black font-black uppercase text-xs tracking-widest flex flex-col items-center gap-3 hover:bg-black/20 transition-all border border-black/5">
                <PackageCheck size={24} /> Edit Inventory
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;