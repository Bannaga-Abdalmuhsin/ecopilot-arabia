import { motion } from 'framer-motion';

export function PersistentBackground({ currentScene }: { currentScene: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-bg-dark">
      {/* Dynamic Gold Glow */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-accent) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Theme background pattern - Riyadh skyline, leaf motif, gold waves */}
      <motion.div
        className="absolute inset-0 opacity-20 mix-blend-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}assets/hero-bg.png)`,
        }}
        animate={{
          scale: currentScene === 0 ? 1 : 1.05,
          opacity: currentScene === 0 ? 0.4 : currentScene === 6 ? 0.1 : 0.2,
          y: currentScene * -10
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* Drifting Saudi Green Orb */}
      <motion.div
         className="absolute w-[80vw] h-[80vw] rounded-full blur-[7vw] mix-blend-screen"
         style={{ backgroundColor: 'var(--color-primary)' }}
         animate={{
           x: currentScene < 2 ? '-20vw' : currentScene < 5 ? '40vw' : '-10vw',
           y: currentScene === 0 ? '-20vh' : currentScene === 6 ? '20vh' : '10vh',
           scale: currentScene === 0 ? 1 : currentScene === 6 ? 1.5 : 1.2
         }}
         transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
      />
      
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
