import { motion } from 'framer-motion';

export default function Scene3() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="w-full h-full max-w-[80vw] mx-auto flex items-center relative z-10">
        
        {/* Left: Copy */}
        <div className="w-1/3 pr-[3vw] relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="text-gold font-bold tracking-[0.2em] mb-[1vw] text-[1vw]">STEP 1</div>
            <h2 className="font-display text-[3vw] font-bold text-white leading-tight">
              Tell us about your building.
            </h2>
            <p className="font-body text-[1.25vw] text-white/70 mt-[1.5vw] leading-relaxed">
              Our streamlined 3-step form gathers the essentials. No complex paperwork required.
            </p>
          </motion.div>
          
          <div className="mt-[3vw] space-y-[1.5vw]">
            {['Facility Type & Age', 'Current Energy Usage', 'Location & Tariffs'].map((item, i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-[1vw]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + (i * 0.3), duration: 0.8 }}
              >
                <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-saudi-green border border-gold flex items-center justify-center text-gold font-bold text-[1vw]">
                  {i + 1}
                </div>
                <span className="text-[1.25vw] font-medium text-white/90">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: UI Mockup */}
        <div className="w-2/3 relative h-[80vh]">
          {/* Main App Window */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 right-0 w-[120%] h-[90%] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            initial={{ x: '100%', rotateY: -15, scale: 0.9, opacity: 0 }}
            animate={{ x: '10%', rotateY: -5, scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5, type: 'spring', bounce: 0.2 }}
            style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/hero-image.jpg)` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </motion.div>

          {/* Animated Callout Cards */}
          <motion.div
            className="absolute top-[20%] left-[-10%] bg-bg-dark/90 backdrop-blur-xl border border-gold/50 p-[1.5vw] rounded-[1vw] shadow-2xl z-30 w-[18vw]"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 3, duration: 0.8, type: 'spring' }}
          >
            <div className="text-white/50 text-[0.75vw] font-bold uppercase tracking-wider mb-[0.5vw]">Building Type</div>
            <div className="flex gap-[0.5vw]">
              <div className="flex-1 bg-saudi-green/40 border border-saudi-green rounded p-[0.5vw] text-center text-white text-[0.875vw]">Commercial</div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded p-[0.5vw] text-center text-white/50 text-[0.875vw]">Residential</div>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-[50%] left-[5%] bg-bg-dark/90 backdrop-blur-xl border border-saudi-green p-[1.5vw] rounded-[1vw] shadow-2xl z-30 w-[20vw]"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 4, duration: 0.8, type: 'spring' }}
          >
            <div className="text-white/50 text-[0.75vw] font-bold uppercase tracking-wider mb-[0.5vw]">Monthly Bill (SAR)</div>
            <div className="h-[3vw] bg-black/40 rounded border border-white/10 flex items-center px-[1vw] relative overflow-hidden">
              <motion.div 
                className="text-white font-mono text-[1.25vw]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.5 }}
              >
                12,500
              </motion.div>
              {/* Fake cursor blink */}
              <motion.div 
                className="w-[2px] h-[1.5vw] bg-gold ml-[0.25vw]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 800 600" preserveAspectRatio="none">
            <motion.path 
              d="M 150 200 L 300 200 L 400 300"
              fill="none" 
              stroke="var(--color-accent)" 
              strokeWidth="2" 
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ delay: 3.5, duration: 1 }}
            />
          </svg>
        </div>

      </div>
    </motion.div>
  );
}
