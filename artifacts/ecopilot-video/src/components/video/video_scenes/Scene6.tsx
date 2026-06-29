import { motion } from 'framer-motion';

export default function Scene6() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full h-full max-w-[80vw] relative pt-[5vw] px-[2.5vw]">
        
        <motion.div 
          className="text-center mb-[4vw] relative z-30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h2 className="font-display text-[3vw] font-bold text-white mb-[1vw]">Track progress over time.</h2>
          <p className="font-body text-[1.25vw] text-white/70">A centralized hub for your facility's energy transformation.</p>
        </motion.div>

        <div className="relative w-full h-[60vh] flex items-center justify-center" style={{ perspective: '2000px' }}>
          
          {/* History Screen (Back) */}
          <motion.div
            className="absolute w-[70%] h-full rounded-[1vw] overflow-hidden shadow-2xl border border-white/20"
            initial={{ opacity: 0, z: -500, x: '-20%', rotateY: 15 }}
            animate={{ opacity: 0.6, z: -200, x: '-15%', rotateY: 10 }}
            transition={{ delay: 1, duration: 1.5, type: 'spring' }}
          >
            <div className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/screen-history.jpg)` }} />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          {/* Auth/Main Screen (Front) */}
          <motion.div
            className="absolute w-[70%] h-full rounded-[1vw] overflow-hidden shadow-2xl border border-gold/40 z-20"
            initial={{ opacity: 0, z: 500, x: '20%', rotateY: -15 }}
            animate={{ opacity: 1, z: 100, x: '10%', rotateY: -5 }}
            transition={{ delay: 1.5, duration: 1.5, type: 'spring' }}
          >
            <div className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/screen-auth.jpg)` }} />
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}
