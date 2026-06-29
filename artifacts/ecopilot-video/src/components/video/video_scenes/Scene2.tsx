import { motion } from 'framer-motion';
import { NumberCounter } from '../NumberCounter';

export default function Scene2() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full max-w-[75vw] grid grid-cols-2 gap-[4vw] items-center">
        
        {/* Left side: Problem */}
        <motion.div
          className="flex flex-col items-start space-y-[1.5vw]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <motion.h2 
            className="font-display text-[2.5vw] text-white/60 uppercase tracking-widest"
          >
            The Problem
          </motion.h2>
          
          <motion.div 
            className="bg-red-500/10 border border-red-500/30 p-[2vw] rounded-[1vw] backdrop-blur-md w-full"
            initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-red-400 font-body font-medium mb-[0.5vw] uppercase tracking-wider text-[1vw]">Rising Energy Costs</h3>
            <div className="font-display font-bold text-[3.5vw] text-red-500 flex items-baseline gap-[0.5vw]">
              <span>SAR</span>
              <NumberCounter from={15000} to={85000} duration={3} delay={1.5} />
              <span className="text-[2vw] text-red-500/60">/mo</span>
            </div>
            
            <div className="mt-[2vw] space-y-[1vw]">
              <div className="flex items-center gap-[1vw] text-white/80">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-red-500" />
                <span className="text-[1.25vw]">Traditional Audits: Weeks to complete</span>
              </div>
              <div className="flex items-center gap-[1vw] text-white/80">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-red-500" />
                <span className="text-[1.25vw]">Thousands of SAR in consulting fees</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side: Solution */}
        <motion.div
          className="flex flex-col items-start space-y-[1.5vw]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 4, duration: 1 }}
        >
          <motion.h2 
            className="font-display text-[2.5vw] text-gold uppercase tracking-widest"
          >
            The Solution
          </motion.h2>

          <motion.div 
            className="bg-saudi-green/40 border border-saudi-green p-[2vw] rounded-[1vw] backdrop-blur-md w-full relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 4.5, duration: 1, type: 'spring' }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ delay: 5.5, duration: 1.5, ease: 'easeInOut' }}
            />
            
            <h3 className="text-gold font-body font-medium mb-[0.5vw] uppercase tracking-wider text-[1vw]">EcoPilot Arabia</h3>
            <div className="font-display font-bold text-[4vw] text-white flex items-baseline gap-[0.5vw] drop-shadow-[0_0_15px_rgba(232,200,116,0.3)]">
              <NumberCounter from={0} to={60} duration={1.5} delay={5} />
              <span className="text-[2.5vw] text-white/80">Seconds</span>
            </div>
            
            <div className="mt-[2vw] space-y-[1vw]">
              <div className="flex items-center gap-[1vw] text-white/90">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-gold shadow-[0_0_8px_var(--color-accent)]" />
                <span className="text-[1.25vw] font-medium">Instant AI-powered insights</span>
              </div>
              <div className="flex items-center gap-[1vw] text-white/90">
                <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-gold shadow-[0_0_8px_var(--color-accent)]" />
                <span className="text-[1.25vw] font-medium">Actionable reduction strategies</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
}
