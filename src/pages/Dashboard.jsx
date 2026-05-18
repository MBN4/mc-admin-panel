import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Clock, 
  Zap, 
  AlertTriangle,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, admin, theme } = useAdminStore();
  const [stats, setStats] = useState({ totalOrders: 0, totalUsers: 0, pendingOrders: 0, totalRevenue: 0 });
  const [analytics, setAnalytics] = useState({ revenueData: [], qualityData: [], statusData: [] });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isSuperAdmin = admin?.email === 'master@madina.com';

  const fetchData = async () => {
    setIsSyncing(true);
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
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNukeSystem = async () => {
    const email = prompt("CRITICAL ACTION: Enter Master Email to proceed:");
    if (!email) return;
    const pass = prompt("Enter Master Password:");
    if (!pass) return;

    if (window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete all Fabrics, Styles, Attributes, and Orders. This action cannot be undone.")) {
      setIsLoading(true);
      try {
        await axios.delete('http://localhost:5000/api/admin/system/nuke', {
          data: { masterEmail: email, masterPass: pass },
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("System wipe complete. Application data has been reset.");
        fetchData();
      } catch (err) {
        alert(err.response?.data?.msg || "Authorization failed. System secured.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const PIE_COLORS = ['#FFD700', '#FBC02D', '#FFA000', '#FF8F00'];
  const chartText = theme === 'dark' ? '#6B7280' : '#4B5563';

  return (
    <div className="space-y-12">
      {(isLoading || isSyncing) && <MagnificentLoader />}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-[#FFD700] font-black text-xs uppercase tracking-[0.4em]">Intelligence Overview</motion.p>
            {isSyncing && <div className="flex items-center gap-1 text-green-500 text-[8px] font-black uppercase tracking-widest animate-pulse"><Zap size={8} /> Live Sync</div>}
          </div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-5xl lg:text-6xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Dashboard</motion.h1>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={handleNukeSystem}
            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg shadow-red-500/10"
          >
            <AlertTriangle size={24} />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`Rs. ${stats.totalRevenue}`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Customers" value={stats.totalUsers} icon={Users} color="bg-[#FFD700]" />
        <StatCard title="Pending" value={stats.pendingOrders} icon={Clock} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 glass-card rounded-[3rem] p-10 min-h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-[var(--text-primary)]"><BarChart3 className="text-[#FFD700]" /> Revenue Trend</h2>
            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Last 7 Days</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke={chartText} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {weekday: 'short'})} />
                <YAxis stroke={chartText} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val}`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '15px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-[3rem] p-10 min-h-[450px]">
          <h2 className="text-2xl font-black tracking-tighter uppercase mb-10 flex items-center gap-3 text-[var(--text-primary)]"><PieChartIcon className="text-[#FFD700]" /> Order Status</h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.statusData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="count" nameKey="status">
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '15px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-[var(--text-primary)]">{stats.totalOrders}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Orders</span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
             {analytics.statusData.map((s, i) => (
               <div key={i} className="flex justify-between items-center px-5 py-3 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)]">
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
                <Bar dataKey="count" fill="#FFD700" radius={[0, 10, 10, 0]} barSize={15} />
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