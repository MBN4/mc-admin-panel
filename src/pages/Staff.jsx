import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Mail, Calendar, UserX, Plus, X, User, Lock, Save, ShieldAlert, KeyRound 
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import MagnificentLoader from '../components/MagnificentLoader';

const CustomModal = ({ title, isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-md p-10 rounded-[3rem] border border-[var(--border)] relative"
        >
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-[var(--text-primary)] transition-colors"><X size={24} /></button>
          <h2 className="text-2xl font-black tracking-tighter text-[var(--text-primary)] mb-8 uppercase tracking-widest">{title}</h2>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Staff = () => {
  const { token, admin } = useAdminStore();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/staff', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setStaff(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAddStaff = async () => {
    if (!formData.username || !formData.email || !formData.password) return;
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/staff', formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setModalOpen(false);
      setFormData({ username: '', email: '', password: '' });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.msg || "Creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const removeAdmin = async (id) => {
    if (!window.confirm("Terminate this administrator's system access permanently?")) return;
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/staff/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (admin?.email !== 'master@madina.com') {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="p-6 bg-red-500/10 rounded-full text-red-500"><ShieldAlert size={48} /></div>
            <p className="font-black uppercase text-red-500 tracking-[0.5em] text-center">Master Clearance Required</p>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      {isLoading && <MagnificentLoader />}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[#FFD700] font-black text-xs uppercase tracking-[0.4em] mb-2">Security Governance</p>
          <h1 className="text-5xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Staff Portal</h1>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="gold-gradient px-8 py-4 rounded-2xl flex items-center gap-3 text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-yellow-500/10 active:scale-95 transition-all"
        >
          <Plus size={18} /> Provision Admin
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {staff.map((member) => (
          <motion.div 
            key={member.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="glass-card p-10 rounded-[3.5rem] border border-[var(--border)] relative group overflow-hidden"
          >
            <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shadow-inner">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase">{member.username || 'Staff'}</h3>
                    <p className="text-[10px] font-black uppercase text-[#FFD700] tracking-widest mt-1">Authorized Manager</p>
                </div>
            </div>
            <div className="space-y-4 border-t border-[var(--border)] pt-8">
                <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
                    <Mail size={16} className="text-[#FFD700]" /> {member.email}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
                    <Calendar size={16} className="text-[#FFD700]" /> Registered {new Date(member.createdAt).toLocaleDateString()}
                </div>
            </div>
            <button 
                onClick={() => removeAdmin(member.id)} 
                className="mt-10 w-full p-4 bg-red-500/5 text-red-500 rounded-2xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
            >
                <UserX size={16} /> Revoke Credentials
            </button>
          </motion.div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full py-24 text-center glass-card rounded-[3.5rem] border border-dashed border-[var(--border)]">
            <KeyRound size={48} className="mx-auto text-gray-500/20 mb-4" />
            <p className="font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">No secondary administrators configured</p>
          </div>
        )}
      </div>

      <CustomModal title="Provision Access" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-[#FFD700] ml-1 tracking-widest">Full Identity</p>
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"><User size={18}/></div>
                    <input 
                        className="w-full input-field rounded-2xl py-5 pl-14 pr-5 outline-none font-bold text-[var(--text-primary)]" 
                        value={formData.username} 
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                        placeholder="e.g. Haris Jamil" 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-[#FFD700] ml-1 tracking-widest">Secure Email</p>
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={18}/></div>
                    <input 
                        className="w-full input-field rounded-2xl py-5 pl-14 pr-5 outline-none font-bold text-[var(--text-primary)]" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        placeholder="admin@madina.com" 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-[#FFD700] ml-1 tracking-widest">Initial Password</p>
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={18}/></div>
                    <input 
                        type="password" 
                        className="w-full input-field rounded-2xl py-5 pl-14 pr-5 outline-none font-bold text-[var(--text-primary)]" 
                        value={formData.password} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        placeholder="••••••••" 
                    />
                </div>
            </div>
            <button 
                onClick={handleAddStaff} 
                className="w-full gold-gradient py-5 rounded-2xl text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl"
            >
                <Save size={18} /> Confirm Provisioning
            </button>
        </div>
      </CustomModal>
    </div>
  );
};

export default Staff;