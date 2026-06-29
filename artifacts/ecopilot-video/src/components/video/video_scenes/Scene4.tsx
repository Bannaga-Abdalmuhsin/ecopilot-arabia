import { motion } from 'framer-motion';
import { NumberCounter } from '../NumberCounter';

export default function Scene4() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[5vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <motion.div
        className="absolute top-[4vw] left-[5vw]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="text-gold font-bold tracking-[0.2em] mb-[0.5vw] text-[1vw]">STEP 2</div>
        <h2 className="font-display text-[2.5vw] font-bold text-white">AI Analysis & Report</h2>
      </motion.div>

      {/* Dashboard Container */}
      <motion.div 
        className="w-full max-w-[75vw] mt-[6vw] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2vw] p-[3vw] shadow-2xl relative overflow-hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.2, type: 'spring', bounce: 0.1 }}
      >
        {/* Background glow for dashboard */}
        <div className="absolute top-0 right-0 w-[35vw] h-[35vw] bg-saudi-green/20 rounded-full blur-[7vw] pointer-events-none" />

        <div className="grid grid-cols-3 gap-[2vw] relative z-10">
          
          {/* Main Score Gauge */}
          <div className="col-span-1 flex flex-col items-center justify-center bg-black/20 rounded-[1.5vw] p-[2vw] border border-white/5">
            <div className="text-white/60 uppercase tracking-widest text-[1vw] font-semibold mb-[2vw]">Energy Efficiency Score</div>
            
            <div className="relative w-[12vw] h-[12vw] flex items-center justify-center">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 192 192">
                <circle 
                  cx="96" cy="96" r="88" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="12" 
                  fill="none" 
                />
                <motion.circle 
                  cx="96" cy="96" r="88" 
                  stroke="var(--color-accent)" 
                  strokeWidth="12" 
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "553", strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: 553 - (553 * 0.72) }} // 72%
                  transition={{ delay: 2, duration: 2, ease: "easeOut" }}
                />
              </svg>
              
              <div className="text-center">
                <div className="font-display font-bold text-[4vw] text-white">
                  <NumberCounter from={0} to={72} duration={2} delay={2} />
                </div>
                <div className="text-gold font-medium mt-[0.25vw] text-[1vw]">/ 100</div>
              </div>
            </div>
            
            <motion.div 
              className="mt-[2vw] bg-gold/10 text-gold px-[1vw] py-[0.5vw] rounded-full text-[1vw] font-medium border border-gold/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 4, type: 'spring' }}
            >
              Needs Improvement
            </motion.div>
          </div>

          {/* KPIs */}
          <div className="col-span-2 grid grid-cols-2 gap-[1.5vw]">
            
            {/* KPI 1 */}
            <motion.div 
              className="bg-black/20 rounded-[1.5vw] p-[1.5vw] border border-white/5 flex flex-col justify-between"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <div className="text-white/50 uppercase tracking-widest text-[0.75vw] font-semibold">Identified Waste</div>
              <div className="font-display text-[2.5vw] text-red-400 font-bold mt-[1vw] flex items-baseline gap-[0.5vw]">
                <NumberCounter from={0} to={34} duration={1.5} delay={1.5} />
                <span className="text-[1.25vw] text-red-400/60">%</span>
              </div>
              <div className="mt-[1vw] text-white/70 text-[0.875vw]">of current consumption</div>
            </motion.div>

            {/* KPI 2 */}
            <motion.div 
              className="bg-black/20 rounded-[1.5vw] p-[1.5vw] border border-white/5 flex flex-col justify-between"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              <div className="text-white/50 uppercase tracking-widest text-[0.75vw] font-semibold">Potential Savings</div>
              <div className="font-display text-[2.5vw] text-saudi-green font-bold mt-[1vw] flex items-baseline gap-[0.5vw]">
                <NumberCounter from={0} to={45000} duration={1.5} delay={1.8} format={(v) => v.toLocaleString()} />
                <span className="text-[1.25vw] text-saudi-green/60">SAR/yr</span>
              </div>
              <div className="mt-[1vw] text-white/70 text-[0.875vw]">Based on recommended actions</div>
            </motion.div>

            {/* KPI 3 (Full width) */}
            <motion.div 
              className="col-span-2 bg-gradient-to-br from-saudi-green/40 to-black/40 rounded-[1.5vw] p-[2vw] border border-saudi-green/50 flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
            >
              <div>
                <div className="text-white/80 uppercase tracking-widest text-[1vw] font-semibold mb-[0.5vw]">Environmental Impact</div>
                <div className="text-white font-medium text-[1.25vw]">Equivalent to planting</div>
              </div>
              <div className="font-display text-[4vw] text-gold font-bold flex items-center gap-[1vw]">
                <NumberCounter from={0} to={1240} duration={2} delay={2.5} />
                <span className="text-[1.5vw] text-gold/80">Trees</span>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
