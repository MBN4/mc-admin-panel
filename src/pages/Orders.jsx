import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { Search, Eye, CheckCircle2, Clock, Truck, X, Package, Phone, User, Printer, MapPin, RefreshCw } from 'lucide-react';
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

const OrderModal = ({ order, onClose, onUpdateStatus, onPrint }) => {
  if (!order) return null;
  const itemsList = order.items || [];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-end bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-2xl h-full glass-card border-l border-[var(--border)] p-8 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-10">
          <div><h2 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Order Review</h2><p className="text-[#FFD700] text-xs font-black uppercase tracking-widest mt-1"># {order.id}</p></div>
          <div className="flex gap-2">
            <button onClick={() => onPrint(order)} className="p-3 bg-[#FFD700] text-black rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase px-6 hover:scale-105 transition-all shadow-lg"><Printer size={16} /> Print</button>
            <button onClick={onClose} className="p-3 bg-[var(--input-bg)] rounded-2xl text-[var(--text-primary)] hover:bg-red-500 transition-all border border-[var(--border)]"><X size={24} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--input-bg)] p-6 rounded-3xl border border-[var(--border)] shadow-sm"><p className="text-[10px] text-[var(--text-secondary)] font-black uppercase mb-1">Buyer</p><div className="flex items-center gap-3 text-[var(--text-primary)]"><User size={14} className="text-[#FFD700]" /><span className="font-bold text-sm uppercase">{order.User?.username || 'Guest'}</span></div></div>
          <div className="bg-[var(--input-bg)] p-6 rounded-3xl border border-[var(--border)] shadow-sm"><p className="text-[10px] text-[var(--text-secondary)] font-black uppercase mb-1">Phone</p><div className="flex items-center gap-3 text-[var(--text-primary)]"><Phone size={14} className="text-[#FFD700]" /><span className="font-bold text-sm">{order.User?.phone || 'N/A'}</span></div></div>
        </div>
        <div className="bg-[var(--input-bg)] p-6 rounded-3xl border border-[var(--border)] shadow-sm mb-10 text-[var(--text-primary)]">
            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase mb-2 tracking-widest">Bilti Details</p>
            <div className="flex items-start gap-3"><MapPin size={14} className="text-[#FFD700] mt-1" /><span className="font-bold text-sm leading-relaxed">{order.bilti_info || 'Not provided'}</span></div>
        </div>
        <div className="space-y-4 mb-10">
          <h3 className="text-xs font-black uppercase text-[var(--text-secondary)] ml-2 tracking-widest uppercase">Ordered manifest</h3>
          {itemsList.map((item, idx) => (
            <div key={idx} className="bg-[var(--input-bg)] p-6 rounded-[2rem] border border-[var(--border)] relative">
                <div className="flex justify-between items-start mb-4">
                    <div><p className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest mb-1">{item.quality}</p><h4 className="text-xl font-black text-[var(--text-primary)] uppercase">{item.style}</h4></div>
                    <div className="bg-[#FFD700] text-black px-4 py-1 rounded-lg text-xs font-black shadow-md">Qty {item.quantity}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-[var(--text-primary)] bg-black/5 p-4 rounded-xl border border-white/5">
                    <div><p className="opacity-40 uppercase text-[7px] mb-0.5">Category</p>{item.category}</div>
                    <div><p className="opacity-40 uppercase text-[7px] mb-0.5">Color</p>{item.color}</div>
                    <div><p className="opacity-40 uppercase text-[7px] mb-0.5">Width</p>{item.width || 'N/A'}</div>
                    <div><p className="opacity-40 uppercase text-[7px] mb-0.5">Price</p>Rs {item.price_at_purchase}</div>
                </div>
            </div>
          ))}
        </div>
        <div className="bg-black p-8 rounded-[2.5rem] mb-10 border border-[var(--border)] flex justify-between items-center shadow-2xl">
            <div><p className="text-[10px] text-gray-500 font-black uppercase">Grand Total</p><p className="text-3xl font-black text-white tracking-tighter">Rs. {order.total_amount}</p></div>
            <StatusBadge status={order.status} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['pending', 'processing', 'shipped', 'delivered'].map(s => (<button key={s} onClick={() => onUpdateStatus(order.id, s)} className={`p-5 rounded-2xl text-[10px] font-black uppercase border transition-all ${order.status === s ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg' : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[#FFD700]'}`}>{s}</button>))}
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
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const fetchOrders = async () => {
    setLoading(true);
    try { 
      const res = await axios.get('http://localhost:5000/api/admin/orders', { 
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
    try { await axios.put(`http://localhost:5000/api/admin/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }); fetchOrders(); setSelectedOrder(null); } 
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
      <div className="fixed -left-[4000px] top-0 opacity-0 pointer-events-none z-[-1] overflow-hidden"><InvoicePrint ref={printRef} order={selectedOrder} /></div>
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
                <td className="p-8 text-right flex justify-end gap-3"><button onClick={() => setSelectedOrder(o)} className="p-4 bg-[var(--input-bg)] text-[var(--text-primary)] rounded-2xl hover:bg-[#FFD700] hover:text-black border border-[var(--border)] transition-all shadow-sm"><Eye size={18} /></button><button onClick={() => { setSelectedOrder(o); setTimeout(() => handlePrint(), 500); }} className="p-4 bg-[var(--input-bg)] text-[#FFD700] rounded-2xl hover:bg-[#FFD700] hover:text-black border border-[var(--border)] transition-all shadow-sm"><Printer size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {filtered.length === 0 && !loading && <div className="p-24 text-center uppercase font-black tracking-widest text-xs opacity-30">No transaction data</div>}
      </div>
      <AnimatePresence>{selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} onPrint={(o) => { setSelectedOrder(o); setTimeout(() => handlePrint(), 500); }} />}</AnimatePresence>
    </div>
  );
};

export default Orders;