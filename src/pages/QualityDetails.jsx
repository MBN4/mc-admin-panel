import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Trash2, Check, X, Layers, Palette, 
  Maximize2, Ruler, Save, Type, Hash, CheckCircle2, AlertCircle, ChevronUp, ChevronDown, Sparkles, Edit2
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import MagnificentLoader from '../components/MagnificentLoader';

const Toast = ({ type, message, onClose }) => (
  <motion.div 
    initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
    className={`fixed top-10 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border ${
      type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
    <p className="font-black text-sm uppercase tracking-widest">{message}</p>
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={18} /></button>
  </motion.div>
);

const CustomModal = ({ title, isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card w-full max-w-md p-10 rounded-[3rem] border border-[var(--border)] relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-[var(--text-primary)]"><X size={24} /></button>
          <h2 className="text-2xl font-black tracking-tighter text-[var(--text-primary)] mb-8 uppercase tracking-widest">{title}</h2>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const QualityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, admin, logout } = useAdminStore();
  const isMaster = admin?.role === 'superadmin' || admin?.role === 'admin';
  
  const [quality, setQuality] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStyleId, setActiveStyleId] = useState(null);
  const [mode, setMode] = useState('structure');
  const [notification, setNotification] = useState(null);
  
  const [styleModal, setStyleModal] = useState({ open: false, name: '' });
  const [attrModal, setAttributeModal] = useState({ open: false, id: null, styleId: null, type: '', value: '', hex_code: '' });
  const [combo, setCombo] = useState({ categoryId: null, colorId: null, widthId: null });
  const [matrixPrices, setMatrixPrices] = useState({});

  const notify = (type, msg) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/qualities', { headers: { Authorization: `Bearer ${token}` } });
      const found = res.data.find(q => q.id === parseInt(id));
      setQuality(found);
      if (found?.Styles?.length > 0 && !activeStyleId) setActiveStyleId(found.Styles[0].id);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const currentStyle = useMemo(() => quality?.Styles?.find(s => s.id === activeStyleId), [quality, activeStyleId]);
  const categories = useMemo(() => currentStyle?.ProductAttributes?.filter(a => a.type === 'category') || [], [currentStyle]);
  const colors = useMemo(() => currentStyle?.ProductAttributes?.filter(a => a.type === 'color') || [], [currentStyle]);
  const widths = useMemo(() => currentStyle?.ProductAttributes?.filter(a => a.type === 'width') || [], [currentStyle]);
  const sizes = useMemo(() => currentStyle?.ProductAttributes?.filter(a => a.type === 'size') || [], [currentStyle]);

  useEffect(() => {
    if (activeStyleId && currentStyle?.PriceMatrices) {
      const initialPrices = {};
      currentStyle.PriceMatrices.forEach(p => {
        const key = `${p.categoryId}-${p.colorId}-${p.widthId || 'none'}-${p.sizeId}`;
        initialPrices[key] = p.price;
      });
      setMatrixPrices(initialPrices);
    }
  }, [activeStyleId, currentStyle]);

  const toggleCombo = (key, val) => setCombo(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));

  const handlePriceUpdate = (key, val) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (cleanVal.length > 5) return;
    setMatrixPrices(prev => ({ ...prev, [key]: cleanVal === '' ? '' : parseInt(cleanVal) }));
  };

  const handlePriceAdjustment = (sid, delta) => {
    const key = `${combo.categoryId}-${combo.colorId}-${combo.widthId || 'none'}-${sid}`;
    const current = parseInt(matrixPrices[key]) || 0;
    const next = Math.max(0, current + delta);
    if (next.toString().length <= 5) setMatrixPrices(prev => ({ ...prev, [key]: next }));
  };

  const handleStyleSubmit = async () => {
    if (!styleModal.name) return;
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/styles', { name: styleModal.name, qualityId: id }, { headers: { Authorization: `Bearer ${token}` } });
      setStyleModal({ open: false, name: '' });
      fetchData();
      notify('success', 'Style created successfully');
    } catch (err) { notify('error', 'Action failed'); } finally { setIsLoading(false); }
  };

  const handleAttributeSubmit = async () => {
    if (!attrModal.value) return;
    setIsLoading(true);
    try {
      const data = { styleId: attrModal.styleId, type: attrModal.type, value: attrModal.value, hex_code: attrModal.hex_code };
      if (attrModal.id) { await axios.put(`http://localhost:5000/api/admin/attributes/${attrModal.id}`, data, { headers: { Authorization: `Bearer ${token}` } }); } 
      else { await axios.post('http://localhost:5000/api/admin/attributes', data, { headers: { Authorization: `Bearer ${token}` } }); }
      setAttributeModal({ open: false, id: null, styleId: null, type: '', value: '', hex_code: '' });
      fetchData();
      notify('success', 'Database updated');
    } catch (err) { notify('error', 'Action failed'); } finally { setIsLoading(false); }
  };

  const savePricing = async () => {
    if (!combo.categoryId || !combo.colorId || (widths.length > 0 && !combo.widthId)) { notify('error', 'Select all combinations'); return; }
    setIsLoading(true);
    try {
        const pricesPayload = sizes.map(s => ({ sizeId: s.id, price: parseInt(matrixPrices[`${combo.categoryId}-${combo.colorId}-${combo.widthId || 'none'}-${s.id}`]) || 0 }));
        await axios.post('http://localhost:5000/api/admin/pricing/update', { styleId: activeStyleId, ...combo, prices: pricesPayload }, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
        notify('success', 'Pricing synced successfully');
    } catch (err) { notify('error', 'Sync failed'); } finally { setIsLoading(false); }
  };

  const seedDummy = async () => {
    if (!window.confirm("Auto-generate all missing prices?")) return;
    setIsLoading(true);
    try { await axios.post('http://localhost:5000/api/admin/pricing/seed-dummy', { qualityId: id }, { headers: { Authorization: `Bearer ${token}` } }); fetchData(); notify('success', 'Seeded successfully'); } 
    catch (err) { notify('error', 'Seeding failed'); } finally { setIsLoading(false); }
  };

  const deleteItem = async (type, itemId) => {
    if (!window.confirm(`Delete this ${type}? This action cannot be undone.`)) return;
    setIsLoading(true);
    try {
      const url = type === 'style' ? `styles/${itemId}` : `attributes/${itemId}`;
      await axios.delete(`http://localhost:5000/api/admin/${url}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      notify('success', 'Deleted successfully');
    } catch (err) { notify('error', 'Delete failed'); } finally { setIsLoading(false); }
  };

  const toggleStock = async (aid, current) => {
    setIsLoading(true);
    try { await axios.put(`http://localhost:5000/api/admin/attributes/${aid}`, { in_stock: !current }, { headers: { Authorization: `Bearer ${token}` } }); fetchData(); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-10 pb-20">
      {isLoading && <MagnificentLoader />}
      <AnimatePresence>{notification && <Toast type={notification.type} message={notification.msg} onClose={() => setNotification(null)} />}</AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
            <button onClick={() => navigate('/qualities')} className="p-4 bg-[var(--input-bg)] rounded-2xl text-[var(--text-primary)] border border-[var(--border)]"><ArrowLeft size={20} /></button>
            <div><p className="text-[#FFD700] font-black text-xs uppercase tracking-widest">{quality?.name}</p><h1 className="text-4xl font-black text-[var(--text-primary)] uppercase">Inventory & Prices</h1></div>
        </div>
        <div className="flex items-center gap-3">
            {isMaster && <button onClick={seedDummy} className="bg-purple-500/10 border border-purple-500/20 px-6 py-3 rounded-xl text-purple-400 font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-purple-500 hover:text-white transition-all"><Sparkles size={14}/> Auto-Price</button>}
            <div className="flex gap-2 p-1 bg-white/5 border border-[var(--border)] rounded-2xl shadow-inner">
                <button onClick={() => setMode('structure')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'structure' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-[var(--text-secondary)]'}`}>Structure</button>
                <button onClick={() => setMode('pricing')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'pricing' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-[var(--text-secondary)]'}`}>Pricing</button>
            </div>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {quality?.Styles?.map(s => (<button key={s.id} onClick={() => { setActiveStyleId(s.id); setCombo({ categoryId: null, colorId: null, widthId: null }); }} className={`px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest border transition-all whitespace-nowrap ${activeStyleId === s.id ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg' : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border)]'}`}>{s.name}</button>))}
        {isMaster && <button onClick={() => setStyleModal({ open: true, name: '' })} className="px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest border border-dashed border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all">+ New Style</button>}
      </div>

      {mode === 'structure' ? (
        <div className="p-10 glass-card rounded-[3.5rem] grid grid-cols-1 lg:grid-cols-2 gap-12 border border-[var(--border)]">
            {[
                { type: 'category', label: 'Categories', icon: Layers },
                { type: 'color', label: 'Colors', icon: Palette },
                { type: 'width', label: 'Widths', icon: Maximize2 },
                { type: 'size', label: 'Sizes', icon: Ruler }
            ].map((group) => (
                <div key={group.type} className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3"><group.icon size={16} className="text-[#FFD700]" /><h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{group.label}</h3></div>
                        <button onClick={() => setAttributeModal({ open: true, id: null, styleId: activeStyleId, type: group.type, value: '', hex_code: '' })} className="p-2 bg-[#FFD700]/10 text-[#FFD700] rounded-lg hover:bg-[#FFD700] hover:text-black transition-all"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {currentStyle?.ProductAttributes?.filter(a => a.type === group.type).map((attr) => (
                            <div key={attr.id} className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all ${attr.in_stock ? 'bg-[var(--input-bg)] border-[var(--border)]' : 'bg-red-500/5 border-red-500/10'}`}>
                                {group.type === 'color' && attr.hex_code && <div className="w-5 h-5 rounded-full border border-black/20 shadow-inner" style={{ backgroundColor: attr.hex_code }} />}
                                <span className={`text-[11px] font-black uppercase ${attr.in_stock ? 'text-[var(--text-primary)]' : 'text-red-400 line-through'}`}>{attr.value}</span>
                                <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2">
                                    <button onClick={() => toggleStock(attr.id, attr.in_stock)} className="text-green-500 hover:text-green-400"><Check size={12} /></button>
                                    <button onClick={() => setAttributeModal({ open: true, id: attr.id, styleId: activeStyleId, type: attr.type, value: attr.value, hex_code: attr.hex_code })} className="text-blue-500 hover:text-blue-400"><Edit2 size={12} /></button>
                                    <button onClick={() => deleteItem('attribute', attr.id)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1 glass-card p-8 rounded-[3rem] space-y-10 border border-[var(--border)] shadow-2xl">
                <div className="space-y-4"><p className="text-[10px] font-black text-[#FFD700] uppercase ml-2 tracking-widest">1. Category</p>
                    <div className="flex flex-wrap gap-2">{categories.map(c => (<button key={c.id} onClick={() => toggleCombo('categoryId', c.id)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${combo.categoryId === c.id ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-black/20 text-gray-500 border-white/5 hover:border-[#FFD700]/30'}`}>{c.value}</button>))}</div>
                </div>
                <div className="space-y-4"><p className="text-[10px] font-black text-[#FFD700] uppercase ml-2 tracking-widest">2. Color</p>
                    <div className="flex flex-wrap gap-3">{colors.map(c => (<button key={c.id} onClick={() => toggleCombo('colorId', c.id)} className={`w-11 h-11 rounded-2xl border-2 transition-all flex items-center justify-center shadow-inner ${combo.colorId === c.id ? 'border-[#FFD700] scale-110 shadow-lg' : 'border-black/10 opacity-60'}`} style={{ backgroundColor: c.hex_code }} >{combo.colorId === c.id && <Check size={18} color={c.value.toLowerCase() === 'black' ? 'white' : 'black'} strokeWidth={4} />}</button>))}</div>
                </div>
                {widths.length > 0 && (<div className="space-y-4"><p className="text-[10px] font-black text-[#FFD700] uppercase ml-2 tracking-widest">3. Width</p>
                    <div className="flex flex-wrap gap-2">{widths.map(w => (<button key={w.id} onClick={() => toggleCombo('widthId', w.id)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${combo.widthId === w.id ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-black/20 text-gray-500 border-white/5 hover:border-[#FFD700]/30'}`}>{w.value}</button>))}</div>
                </div>)}
                <button onClick={savePricing} className="w-full gold-gradient p-6 rounded-[2rem] text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"><Save size={18} /> Update Pricing</button>
            </div>
            <div className="xl:col-span-2 glass-card rounded-[3.5rem] p-8 min-h-[500px] border border-[var(--border)] shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {sizes.map(s => {
                        const key = `${combo.categoryId}-${combo.colorId}-${combo.widthId || 'none'}-${s.id}`;
                        return (
                            <div key={s.id} className="bg-black/10 border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-center shadow-inner">
                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase mb-4 tracking-widest text-center opacity-60">Size {s.value}</p>
                                <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#FFD700] transition-all relative">
                                    <div className="px-4 text-[#FFD700] font-black text-[10px] border-r border-white/5 py-4 bg-white/2">Rs</div>
                                    <input type="number" className="flex-1 bg-transparent px-4 py-4 outline-none text-white font-black text-lg min-w-0" value={matrixPrices[key] ?? ''} onChange={(e) => handlePriceUpdate(key, e.target.value)} />
                                    <div className="flex flex-col bg-white/2 border-l border-white/5">
                                        <button onClick={() => handlePriceAdjustment(s.id, 5)} className="px-3 py-2 border-b border-white/5 hover:bg-[#FFD700] hover:text-black transition-all text-[#FFD700]/50"><ChevronUp size={14}/></button>
                                        <button onClick={() => handlePriceAdjustment(s.id, -5)} className="px-3 py-2 hover:bg-red-500 hover:text-white transition-all text-red-500/50"><ChevronDown size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      <CustomModal title="Style Setup" isOpen={styleModal.open} onClose={() => setStyleModal({ ...styleModal, open: false })}>
        <div className="space-y-6">
            <div className="space-y-2"><p className="text-[10px] font-black uppercase text-[#FFD700] ml-1 tracking-widest">Style Name</p>
                <div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"><Type size={18}/></div><input className="w-full input-field rounded-2xl py-5 pl-14 pr-5 outline-none font-bold text-white" value={styleModal.name} onChange={(e) => setStyleModal({ ...styleModal, name: e.target.value })} placeholder="e.g. Roll Patti" /></div>
            </div>
            <button onClick={handleStyleSubmit} className="w-full gold-gradient py-5 rounded-2xl text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl shadow-yellow-500/10"><Save size={18} /> Confirm</button>
        </div>
      </CustomModal>

      <CustomModal title="Attribute" isOpen={attrModal.open} onClose={() => setAttributeModal({ ...attrModal, open: false })}>
        <div className="space-y-6">
            <div className="space-y-2"><p className="text-[10px] font-black uppercase text-[#FFD700] ml-1 tracking-widest">Entry Value</p>
                <div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"><Type size={18}/></div><input className="w-full input-field rounded-2xl py-5 pl-14 pr-5 outline-none font-bold text-white placeholder:text-gray-600" value={attrModal.value} onChange={(e) => setAttributeModal({ ...attrModal, value: e.target.value })} placeholder="Enter label..." /></div>
            </div>
            {attrModal.type === 'color' && (<div className="space-y-2"><p className="text-[10px] font-black uppercase text-[#FFD700] ml-1 tracking-widest">HEX Code</p>
                <div className="relative"><div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"><Hash size={18}/></div><input className="w-full input-field rounded-2xl py-5 pl-14 pr-5 outline-none font-bold text-white placeholder:text-gray-600" placeholder="#000000" value={attrModal.hex_code} onChange={(e) => setAttributeModal({ ...attrModal, hex_code: e.target.value })} /></div>
            </div>)}
            <button onClick={handleAttributeSubmit} className="w-full gold-gradient py-5 rounded-2xl text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl shadow-yellow-500/10"><Save size={18} /> Save</button>
        </div>
      </CustomModal>
    </div>
  );
};

export default QualityDetails;