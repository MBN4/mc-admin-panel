import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, CheckCircle2, Clock, Truck, X, Package, RefreshCw, Download } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import MagnificentLoader from '../components/MagnificentLoader';
import InvoicePrint from '../components/InvoicePrint';

const StatusBadge = ({ status }) => {
  const configs = {
    pending: { color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: Clock },
    processing: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Package },
    shipped: { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: Truck },
    delivered: { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2 },
  };
  const config = configs[status?.toLowerCase()] || configs.pending;
  const Icon = config.icon;
  return (<div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${config.color}`}><Icon size={12} /> {status}</div>);
};

const OrderModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;
  const handleSavePdf = () => window.print();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto no-print" onClick={onClose}>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-[900px] my-6 mx-4 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center gap-3 no-print">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Invoice Preview</h2>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mt-1">Order # {order.id}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSavePdf} className="p-3 bg-[#FFD700] text-black rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase px-6 hover:scale-105 transition-all shadow-lg">
              <Download size={16} /> Save as PDF
            </button>
            <button onClick={onClose} className="p-3 bg-[var(--input-bg)] rounded-2xl text-[var(--text-primary)] hover:bg-red-500 transition-all border border-[var(--border)]">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
          <InvoicePrint order={order} />
        </div>

        <div className="grid grid-cols-4 gap-2 no-print">
          {['pending', 'processing', 'shipped', 'delivered'].map(s => (
            <button key={s} onClick={() => onUpdateStatus(order.id, s)} className={`p-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${order.status === s ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg' : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[#FFD700]'}`}>{s}</button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Orders = () => {
  const { token } = useAdminStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try { 
      const res = await axios.get('/api/admin/orders', { 
        headers: { Authorization: `Bearer ${token}` } 
      }); 
      setOrders(res.data); 
    } 
    catch (e) { 
      console.error("Order Fetch Error:", e.response?.data || e.message);
      alert("Failed to fetch orders. Check console for details.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    setLoading(true);
    try { await axios.put(`/api/admin/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }); fetchOrders(); setSelectedOrder(null); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = orders.filter(o => {
    const sTerm = searchTerm.toLowerCase();
    const idS = o.id.toString();
    const phoneS = o.User?.phone || "";
    const nameS = o.User?.username?.toLowerCase() || "";
    return (idS.includes(sTerm) || phoneS.includes(sTerm) || nameS.includes(sTerm)) && (filter === 'all' || o.status === filter);
  });

  return (
    <div className="space-y-12">
      {loading && <MagnificentLoader />}
      <header className="flex justify-between items-end">
        <div><p className="text-[#FFD700] font-black text-xs uppercase tracking-[0.4em] mb-2">Order Vault</p><h1 className="text-5xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Orders</h1></div>
        <button onClick={fetchOrders} className="p-4 bg-[var(--input-bg)] rounded-2xl text-[#FFD700] border border-[var(--border)] hover:rotate-180 transition-all duration-700 shadow-xl"><RefreshCw size={20} /></button>
      </header>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${filter === f ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-md' : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border)]'}`}>{f}</button>))}
      </div>
      <div className="relative group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-all" size={20} /><input type="text" placeholder="Search orders..." className="w-full input-field rounded-3xl py-6 pl-16 pr-6 outline-none text-sm font-bold shadow-2xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <div className="glass-card rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead><tr className="bg-[var(--input-bg)] border-b border-[var(--border)]"><th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">ID</th><th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Client</th><th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Total</th><th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Status</th><th className="p-8"></th></tr></thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-white/5 transition-all group/row">
                <td className="p-8 font-black text-[var(--text-primary)] text-sm">#{o.id}</td>
                <td className="p-8"><p className="font-bold text-[var(--text-primary)] text-sm uppercase">{o.User?.username || 'Guest'}</p><p className="text-[10px] text-[#FFD700] font-black">{o.User?.phone || '-'}</p></td>
                <td className="p-8 font-black text-[var(--text-primary)] text-sm">Rs {o.total_amount?.toLocaleString()}</td>
                <td className="p-8"><StatusBadge status={o.status} /></td>
                <td className="p-8 text-right flex justify-end gap-3"><button onClick={() => setSelectedOrder(o)} className="p-4 bg-[var(--input-bg)] text-[var(--text-primary)] rounded-2xl hover:bg-[#FFD700] hover:text-black border border-[var(--border)] transition-all shadow-sm"><Eye size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {filtered.length === 0 && !loading && <div className="p-24 text-center uppercase font-black tracking-widest text-xs opacity-30">No transaction data</div>}
      </div>
      <AnimatePresence>{selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} />}</AnimatePresence>
    </div>
  );
};

export default Orders;