import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAdminStore((state) => state.logout);
  const admin = useAdminStore((state) => state.admin);
  const theme = useAdminStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const isMaster = admin?.role === 'admin' || admin?.role === 'superadmin';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Qualities', path: '/qualities', icon: Layers },
    { name: 'Customers', path: '/customers', icon: Users },
  ];

  if (isMaster) {
    menuItems.push({ name: 'Staff', path: '/staff', icon: ShieldAlert });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-main)] overflow-hidden transition-colors duration-500">
      <aside className="hidden lg:flex flex-col w-72 glass-card z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              <ShoppingBag size={20} className="text-black" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-[var(--text-primary)]">Madina <span className="text-[#FFD700]">Panel</span></span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-yellow-500/10 text-[#FFD700] border border-yellow-500/20 shadow-[0_0_15px_rgba(255,215,0,0.05)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} />
                    <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>
                  </div>
                  {isActive && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-[var(--border)] space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Interface</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-[var(--border)]">
               <Users size={18} className="text-[#FFD700]" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest leading-none mb-1">
                {isMaster ? 'Super Admin' : 'Admin'}
              </p>
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/5 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={18} />
            Logout System
          </button>
          <div className="pt-2 text-center text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
            Designed &amp; Developed by{' '}
            <a
              href="https://toptrendingms.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFD700] hover:opacity-100 transition-opacity"
            >
              TOPTRENDING
            </a>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        <header className="lg:hidden p-6 flex items-center justify-between glass-card border-b border-[var(--border)]">
          <span className="font-black text-lg tracking-tighter uppercase text-[var(--text-primary)]">Madina <span className="text-[#FFD700]">Panel</span></span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-[#FFD700]">
              <Menu size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative z-10">
          <Outlet />
        </div>
      </main>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[var(--bg-main)] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
               <span className="font-black text-2xl uppercase tracking-tighter text-[var(--text-primary)]">Menu</span>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[var(--text-primary)]"><X size={32} /></button>
            </div>
            <nav className="space-y-4">
               {menuItems.map((item) => (
                 <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between text-2xl font-black uppercase tracking-tighter p-4 border-b border-[var(--border)] text-[var(--text-primary)]"
                 >
                   {item.name}
                   <ChevronRight className="text-[#FFD700]" />
                 </Link>
               ))}
            </nav>
            <button onClick={handleLogout} className="mt-auto p-6 bg-red-500/10 text-red-500 rounded-3xl font-black uppercase tracking-widest">Logout System</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;