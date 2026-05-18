import React from 'react';
import { motion } from 'framer-motion';

const MagnificentLoader = () => {
  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderRadius: ["25%", "50%", "25%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 gold-gradient shadow-[0_0_50px_rgba(255,215,0,0.3)]"
        />
        <motion.div
          animate={{ scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-10 h-10 bg-white/20 blur-xl rounded-full"
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-[#FFD700] gold-glow"
      >
        Syncing Secure Data
      </motion.p>
    </div>
  );
};

export default MagnificentLoader;