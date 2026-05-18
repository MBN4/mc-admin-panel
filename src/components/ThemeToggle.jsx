import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useAdminStore();
  const isDark = theme === 'dark';

  return (
    <div 
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full cursor-pointer p-1 bg-white/5 border border-white/10 glass-card"
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none"
        initial={false}
      >
        <Sun size={12} className={`${isDark ? 'text-gray-600' : 'text-[#FFD700]'}`} />
        <Moon size={12} className={`${isDark ? 'text-[#FFD700]' : 'text-gray-400'}`} />
      </motion.div>

      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 30,
          mass: 1
        }}
        animate={{
          x: isDark ? 32 : 0,
          scale: [1, 1.2, 1],
          rotate: isDark ? 360 : 0
        }}
        className="w-6 h-6 rounded-full gold-gradient shadow-lg flex items-center justify-center relative z-10"
      >
        <motion.div
          animate={{ scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0 }}
          className="absolute"
        >
          <Moon size={10} className="text-black" />
        </motion.div>
        <motion.div
          animate={{ scale: isDark ? 0 : 1, opacity: isDark ? 0 : 1 }}
          className="absolute"
        >
          <Sun size={10} className="text-black" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThemeToggle;