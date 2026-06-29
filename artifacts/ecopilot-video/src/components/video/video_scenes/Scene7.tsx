import { motion } from 'framer-motion';

export default function Scene7() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      {/* Dynamic Background replacing the main persistent one for the outro */}
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-br from-saudi-green via-bg-dark to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      {/* Islamic Geometric Pattern Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%23E8C874' stroke-width='1'/%3E%3Cpath d='M15 15l30 30M45 15L15 45' stroke='%23E8C874' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Gold vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-0" />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.5, type: 'spring', bounce: 0.2 }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}assets/logo-icon.png`} 
          className="w-[12vw] h-[12vw] object-contain drop-shadow-[0_0_30px_rgba(232,200,116,0.3)]"
          alt="Logo"
        />
        
        <motion.h1
          className="font-display font-bold text-[5vw] text-white mt-[2vw] tracking-tight drop-shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          EcoPilot Arabia
        </motion.h1>

        <motion.div
          className="w-[6vw] h-[4px] bg-gold mt-[2vw] rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        />

        <motion.p
          className="font-body text-[1.5vw] mt-[2vw] text-gold uppercase tracking-widest font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          ecopilot.sa
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
