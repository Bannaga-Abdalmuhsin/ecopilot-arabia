import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export function NumberCounter({ 
  from = 0, 
  to, 
  duration = 2, 
  delay = 0, 
  format = (v: number) => Math.round(v).toString() 
}: { 
  from?: number; 
  to: number; 
  duration?: number; 
  delay?: number; 
  format?: (v: number) => string;
}) {
  const value = useMotionValue(from);
  const display = useTransform(value, (v) => format(v));

  useEffect(() => {
    const controls = animate(value, to, {
      duration,
      delay,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, to, duration, delay]);

  return <motion.span>{display}</motion.span>;
}
