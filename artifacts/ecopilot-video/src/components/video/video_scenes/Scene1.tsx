import { motion } from 'framer-motion';

export default function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'var(--color-accent)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <img 
          src={`${import.meta.env.BASE_URL}assets/logo-icon.png`} 
          className="w-[12vw] h-[12vw] relative z-10 object-contain drop-shadow-2xl"
          alt="EcoPilot Arabia Logo"
        />
      </motion.div>

      <motion.div className="overflow-hidden mt-[2vw]">
        <motion.h1
          className="font-display font-bold text-[5vw] text-white tracking-tight drop-shadow-lg"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          EcoPilot Arabia
        </motion.h1>
      </motion.div>

      <motion.p
        className="font-body text-[1.5vw] mt-[2vw] text-gold uppercase tracking-[0.25em] drop-shadow-md"
        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 2, duration: 1.5, ease: 'easeOut' }}
      >
        Artificial Intelligence In Energy Efficiency
      </motion.p>
    </motion.div>
  );
}
