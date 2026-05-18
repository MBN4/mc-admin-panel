import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Key, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', adminSecret: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin/register', formData);
      setMessage({ type: 'success', text: res.data.msg });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Connection to backend failed';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 magnificent-bg overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-6">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex p-4 rounded-[1.5rem] bg-yellow-500/5 border border-yellow-500/20 mb-4 gold-glow"
          >
            <ShieldCheck size={40} className="text-[#FFD700]" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            ADMIN <span className="text-[#FFD700]">HUB</span>
          </h1>
          <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase">Secure Registration Protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-[2.5rem] shadow-2xl space-y-4">
          {message.text && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-3 rounded-xl text-[11px] font-black border text-center ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
              {message.text.toUpperCase()}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#FFD700] transition-colors" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full input-field rounded-2xl py-4 pl-14 pr-5 outline-none text-white placeholder:text-gray-700 text-sm font-semibold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#FFD700] transition-colors" size={18} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                className="w-full input-field rounded-2xl py-4 pl-14 pr-14 outline-none text-white placeholder:text-gray-700 text-sm font-semibold"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative group">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FFD700]/40 group-focus-within:text-[#FFD700] transition-colors" size={18} />
              <input
                type="password"
                placeholder="Admin Secret Key"
                className="w-full input-field border-[#FFD700]/20 rounded-2xl py-4 pl-14 pr-5 outline-none text-white placeholder:text-gray-700 text-sm font-semibold"
                value={formData.adminSecret}
                onChange={(e) => setFormData({...formData, adminSecret: e.target.value})}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full gold-gradient hover:brightness-110 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(251,192,45,0.2)] text-sm"
          >
            {loading ? 'PROCESSING...' : 'REGISTER ACCOUNT'}
            {!loading && <ArrowRight size={18} />}
          </motion.button>
        </form>

        <div className="text-center mt-8">
          <Link to="/login" className="inline-block">
             <span className="text-gray-500 font-bold text-[11px] uppercase tracking-widest transition-colors hover:text-[#FFD700]">
                Already authorized? <span className="text-[#FFD700] border-b border-[#FFD700]/30 pb-0.5">Login</span>
             </span>
          </Link>
          <div className="mt-4 text-[9px] text-gray-700 uppercase tracking-[0.4em] font-black opacity-50">
            Protected by Madina Collar Security Protocol
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRegister;