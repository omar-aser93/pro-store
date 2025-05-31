'use client';

import { motion } from 'framer-motion';      // importing framer-motion for animations

// a wrapper component for animating its children using framer-motion
const AnimationTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut"}}>
        {children}
    </motion.div>
  );
}

export default AnimationTransition