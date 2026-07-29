import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  UserCircle,
  Edit3,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

const CustomerEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    username: user.username || '', 
    email: user.email || '', 
    phone: user.phone || '' 
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card w-full max-w-lg p-10 rounded-[3rem] relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-[var(--text-primary)] transition-colors"><X size={24} /></button>
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#FFD700]/10 rounded-2xl text-[#FFD700]"><UserCircle size={32} /></div>
            <div>
                <h2 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Edit profile</h2>
                <p className="text-[10px] text-[#FFD700] font-black uppercase tracking-widest">ID: #{user.id}</p>
            </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] ml-1">Username</p>
            <input className="w-full input-field rounded-2xl p-5 outline-none font-bold" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] ml-1">Phone Number</p>
            <input className="w-full input-field rounded-2xl p-5 outline-none font-bold" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] ml-1">Email Address</p>
            <input className="w-full input-field rounded-2xl p-5 outline-none font-bold" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <button onClick={() => onSave(user.id, formData)} className="w-full gold-gradient py-5 rounded-2xl text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/10 mt-4 active:scale-[0.98] transition-transform">
            <Save size={20} /> Update info
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Customers = () => {
  const token = useAdminStore((state) => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (id, data) => {
    try {
      await axios.put(`/api/admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setEditUser(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[#FFD700] font-black text-xs uppercase tracking-[0.4em] mb-2">User Directory</p>
        <h1 className="text-5xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Customers</h1>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search customers..."
          className="w-full input-field rounded-3xl py-6 pl-16 pr-6 outline-none text-sm font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-card rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--input-bg)]">
                <th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-[0.2em]">Profile</th>
                <th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-[0.2em]">Contact</th>
                <th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-[0.2em]">Registration</th>
                <th className="p-8 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.map((user) => (
                <motion.tr key={user.id} layout className="hover:bg-[var(--input-bg)] transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/10 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-black transition-all">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <p className="font-black text-[var(--text-primary)] text-sm uppercase tracking-tight">{user.username || 'N/A'}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-0.5">#{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] text-xs font-bold"><Phone size={14} className="text-[#FFD700]" /> {user.phone || 'N/A'}</div>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs font-bold"><Mail size={14} className="text-[#FFD700]" /> {user.email || 'No Email'}</div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest"><Calendar size={14} className="text-[#FFD700]" /> {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center justify-end gap-3">
                        <button onClick={() => setEditUser(user)} className="p-4 bg-[var(--input-bg)] text-[var(--text-primary)] rounded-2xl hover:bg-[#FFD700] hover:text-black transition-all border border-[var(--border)]"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(user.id)} className="p-4 bg-red-500/5 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editUser && (
          <CustomerEditModal 
            user={editUser} 
            onClose={() => setEditUser(null)} 
            onSave={handleUpdate} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;