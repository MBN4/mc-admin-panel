import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit3, X, Image as ImageIcon, Save, Upload, Link as LinkIcon, Settings2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAdminStore } from '../store/useAdminStore';
import MagnificentLoader from '../components/MagnificentLoader';

const QualityModal = ({ quality, onClose, onSave }) => {
  const [formData, setFormData] = useState(quality || { name: '', image_url: '', tag: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(quality?.image_url || null);
  const [useLink, setUseLink] = useState(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setUseLink(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md overflow-y-auto">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card w-full max-w-lg p-8 md:p-10 rounded-[3rem] relative my-auto">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-[var(--text-primary)] transition-colors"><X size={24} /></button>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[var(--text-primary)] mb-8 uppercase">{quality ? 'Edit Item' : 'New Item'}</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Fabric Name</p>
            <input className="w-full input-field rounded-2xl p-4 md:p-5 outline-none font-bold text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Madina Collar" />
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Image Source</p>
            <div className="flex gap-2 p-1 bg-white/5 border border-[var(--border)] rounded-2xl">
                <button onClick={() => setUseLink(true)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${useLink ? 'bg-[#FFD700] text-black shadow-lg' : 'text-gray-500'}`}><LinkIcon size={12}/> Link</button>
                <button onClick={() => setUseLink(false)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${!useLink ? 'bg-[#FFD700] text-black shadow-lg' : 'text-gray-500'}`}><Upload size={12}/> File</button>
            </div>
            {useLink ? (
                <input className="w-full input-field rounded-2xl p-4 md:p-5 outline-none font-bold text-sm" value={formData.image_url} onChange={(e) => {setFormData({...formData, image_url: e.target.value}); setPreview(e.target.value)}} placeholder="Paste link..." />
            ) : (
                <label className="w-full h-24 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-all">
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    <Upload size={20} className="text-gray-500 mb-1" />
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Image</span>
                </label>
            )}
            {preview && (
                <div className="relative w-full h-32 bg-black rounded-2xl overflow-hidden border border-white/10 mt-2">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button onClick={() => {setPreview(null); setSelectedFile(null); setFormData({...formData, image_url: ''})}} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white"><X size={12}/></button>
                </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Tag</p>
            <input className="w-full input-field rounded-2xl p-4 md:p-5 outline-none font-bold text-sm" value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} placeholder="e.g. Premium" />
          </div>
          <button onClick={() => onSave(formData, selectedFile)} className="w-full gold-gradient py-4 md:p-5 rounded-2xl text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform text-xs">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SortableQualityCard = ({ item, navigate, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div ref={setNodeRef} style={style} layout className="glass-card rounded-[3rem] overflow-hidden group relative">
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-black/50 text-white cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={16} />
      </button>
      <div className="h-64 bg-black relative flex items-center justify-center overflow-hidden">
        {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" /> : <ImageIcon size={48} className="text-white/10" />}
        {item.tag && <div className="absolute top-6 left-6 gold-gradient px-4 py-1.5 rounded-full text-[10px] font-black text-black uppercase tracking-widest shadow-lg">{item.tag}</div>}
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase mb-6 truncate">{item.name}</h3>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate(`/qualities/${item.id}`)} className="w-full gold-gradient p-4 rounded-2xl text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/10"><Settings2 size={14} /> Manage Configuration</button>
          <div className="flex gap-2">
              <button onClick={() => onEdit(item)} className="flex-1 bg-[var(--input-bg)] hover:bg-[#FFD700] hover:text-black p-4 rounded-2xl text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-[var(--border)] transition-all"><Edit3 size={14} /> Edit</button>
              <button onClick={() => onDelete(item.id)} className="bg-red-500/5 hover:bg-red-500 p-4 rounded-2xl text-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest border border-red-500/10 transition-all"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Qualities = () => {
  const navigate = useNavigate();
  const token = useAdminStore((state) => state.token);
  const [qualities, setQualities] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQualities = async () => {
    setIsLoading(true);
    try {
        const res = await axios.get('/api/admin/qualities');
        setQualities(res.data);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchQualities(); }, []);

  const handleSave = async (data, file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('tag', data.tag || '');
      formData.append('price', data.price || 0);
      if (file) { 
        formData.append('image', file); 
      } else { 
        formData.append('image_url', data.image_url || ''); 
      }
      
      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      };

      if (data.id) {
        await axios.put(`/api/admin/qualities/${data.id}`, formData, config);
      } else {
        await axios.post('/api/admin/qualities', formData, config);
      }
      fetchQualities();
      setShowModal(false);
    } catch (err) { 
      console.error("Upload Error:", err.response?.data || err.message);
      alert('Failed: ' + (err.response?.data?.msg || err.message));
      setIsLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    setIsLoading(true);
    try {
        await axios.delete(`/api/admin/qualities/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchQualities();
    } finally { setIsLoading(false); }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = qualities.findIndex((q) => q.id === active.id);
    const newIndex = qualities.findIndex((q) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(qualities, oldIndex, newIndex);
    setQualities(reordered);
    try {
      await axios.put(
        '/api/admin/reorder',
        { entityType: 'quality', items: reordered.map((q, idx) => ({ id: q.id, sortOrder: idx })) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error('Reorder failed:', err.response?.data || err.message);
      fetchQualities();
    }
  };

  return (
    <div className="space-y-12">
      {isLoading && <MagnificentLoader />}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[#FFD700] font-black text-xs uppercase tracking-[0.4em] mb-2">Inventory System</p>
          <h1 className="text-5xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Qualities</h1>
        </div>
        <button onClick={() => { setModalData(null); setShowModal(true); }} className="gold-gradient px-8 py-4 rounded-2xl flex items-center gap-3 text-black font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform"><Plus size={18} /> New Collection</button>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={qualities.map((q) => q.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {qualities.map((item) => (
              <SortableQualityCard
                key={item.id}
                item={item}
                navigate={navigate}
                onEdit={(q) => { setModalData(q); setShowModal(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <AnimatePresence>{showModal && <QualityModal quality={modalData} onClose={() => setShowModal(false)} onSave={handleSave} />}</AnimatePresence>
    </div>
  );
};

export default Qualities;