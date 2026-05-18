import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminStore } from '../store/useAdminStore';

const AdminLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAdminStore((state) => state.setAuth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      if (res.data.user.role !== 'admin' && res.data.user.role !== 'superadmin') {
        setError('Access Denied: Clearance Required.');
        return;
      }
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Auth Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 magnificent-bg overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 rounded-[2rem] bg-yellow-500/5 border border-yellow-500/20 mb-6 gold-glow shadow-xl">
            <LogIn size={48} className="text-[#FFD700]" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase flex justify-center gap-2">
            <span className="text-gray-400">System</span>
            <span className="text-[#FFD700]">Access</span>
          </h1>
          <p className="text-gray-500 font-bold tracking-[0.3em] text-[10px] uppercase">Administrator Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-10 rounded-[3rem] shadow-2xl space-y-6">
          {error && <div className="p-4 rounded-2xl text-[11px] font-black border bg-red-500/10 border-red-500/50 text-red-400 text-center uppercase">{error}</div>}
          
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={20} />
              <input type="email" placeholder="Email Address" className="w-full input-field rounded-2xl py-5 pl-14 pr-5 outline-none font-bold text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={20} />
              <input type={showPass ? "text" : "password"} placeholder="Password" className="w-full input-field rounded-2xl py-5 pl-14 pr-14 outline-none font-bold text-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFD700] transition-all">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end px-2">
            <Link to="/forgot-password" size={18} className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest hover:underline transition-all">Forgot password?</Link>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full gold-gradient hover:brightness-110 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(251,192,45,0.3)] transition-all">
            {loading ? 'VERIFYING...' : 'LOGIN TO SYSTEM'}
            {!loading && <ArrowRight size={20} />}
          </motion.button>
        </form>

        <div className="text-center mt-10">
          <Link to="/register" className="inline-block group">
             <span className="text-gray-400 font-bold text-[11px] uppercase tracking-widest transition-colors group-hover:text-[#FFD700]">
                Request Access? <span className="text-[#FFD700] border-b-2 border-[#FFD700]/30 pb-0.5 group-hover:border-[#FFD700]">Register Account</span>
             </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;