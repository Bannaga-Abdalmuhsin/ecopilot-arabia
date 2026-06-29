import { motion } from 'framer-motion';

export default function Scene5() {
  const priorities = [
    { title: 'HVAC Optimization', cost: 'Low', savings: 'High', color: 'bg-red-500', amount: '22,500' },
    { title: 'LED Lighting Upgrade', cost: 'Medium', savings: 'Medium', color: 'bg-amber-500', amount: '15,000' },
    { title: 'Smart Sensor Installation', cost: 'Medium', savings: 'Low', color: 'bg-saudi-green', amount: '7,500' },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 px-[5vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-[80vw] grid grid-cols-12 gap-[3vw]">
        
        {/* Left Col: AI Exec Summary */}
        <div className="col-span-5 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="text-saudi-green font-bold tracking-[0.2em] mb-[1vw] text-[0.875vw] bg-saudi-green/10 inline-block px-[1vw] py-[0.25vw] rounded-full border border-saudi-green/30">
              ACTION PLAN
            </div>
            <h2 className="font-display text-[3vw] font-bold text-white leading-tight mb-[2vw]">
              Prioritized path to ROI.
            </h2>
            
            <div className="bg-black/30 border border-white/10 rounded-[1.5vw] p-[2vw] backdrop-blur-md relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 w-[4px] h-full bg-gold"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1, duration: 1 }}
              />
              <div className="flex items-center gap-[0.75vw] mb-[1vw]">
                <div className="w-[1.5vw] h-[1.5vw] rounded bg-gold/20 flex items-center justify-center">
                  <div className="w-[0.75vw] h-[0.75vw] rounded-full bg-gold animate-pulse" />
                </div>
                <h3 className="text-gold font-semibold tracking-wider text-[0.875vw] uppercase">AI Executive Summary</h3>
              </div>
              <p className="text-white/80 leading-relaxed text-[1.125vw]">
                "The facility's primary inefficiency lies in its outdated chiller plant configuration. By addressing HVAC scheduling and retrofitting lighting to LED, you can achieve a <strong className="text-white">return on investment in under 14 months</strong>."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Col: Priority Cards */}
        <div className="col-span-7 flex flex-col justify-center gap-[1.5vw]">
          {priorities.map((item, i) => (
            <motion.div
              key={i}
              className="bg-white/5 border border-white/10 rounded-[1vw] overflow-hidden shadow-xl flex"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + (i * 0.4), duration: 0.8, type: 'spring' }}
            >
              {/* Color strip */}
              <div className={`w-[0.75vw] ${item.color}`} />
              
              <div className="p-[1.5vw] flex-1 flex items-center justify-between bg-gradient-to-r from-black/40 to-transparent">
                <div>
                  <div className="text-white/50 text-[0.75vw] font-bold uppercase tracking-widest mb-[0.25vw]">
                    Priority {i + 1}
                  </div>
                  <h4 className="text-[1.25vw] font-bold text-white mb-[0.5vw]">{item.title}</h4>
                  <div className="flex gap-[1vw] text-[0.875vw]">
                    <span className="text-white/60">Est. Cost: <span className="text-white">{item.cost}</span></span>
                    <span className="text-white/60">Impact: <span className="text-white">{item.savings}</span></span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-saudi-green font-display font-bold text-[2vw]">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 + (i * 0.4) }}
                    >
                      {item.amount}
                    </motion.span>
                  </div>
                  <div className="text-saudi-green/60 text-[0.875vw]">SAR Savings / yr</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
