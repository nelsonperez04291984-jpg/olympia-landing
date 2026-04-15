import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * MagneticButton component inspired by DesignSpells.
 * Creates a high-fidelity "pull" interaction where the element follows the cursor nearby.
 * Includes a "liquid shimmer" effect that reacts to the mouse position.
 */
const MagneticButton = ({ 
  children, 
  className = "", 
  anchorId = "", 
  href = "#",
  variant = "primary" // "primary" or "secondary" (glass)
}) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);

  // Check for fine pointer (mouse) to avoid issues on mobile
  useEffect(() => {
    setCanAnimate(window.matchMedia('(pointer: fine)').matches);
  }, []);
  
  // Motion values for the button position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // High-fidelity spring config: snappier and lighter
  const springConfig = { stiffness: 250, damping: 20, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  // Logic for the Liquid Shimmer
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!ref.current || !canAnimate) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calculate distance from center
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Magnetic pull strength
    const pullStrength = 0.4; 
    x.set(distanceX * pullStrength);
    y.set(distanceY * pullStrength);
    
    // Shimmer gradient percentage
    const perX = ((clientX - left) / width) * 100;
    const perY = ((clientY - top) / height) * 100;
    setCursorPos({ x: perX, y: perY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    setCursorPos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      className="relative z-10"
    >
      <a
        href={href}
        className={`
          relative group overflow-hidden block transition-all duration-500
          ${className}
          ${variant === 'primary' ? 'bg-white' : 'bg-white/5 backdrop-blur-md'}
        `}
      >
        {/* DESIGN SPELL 1: Rotating Border Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c084fc_0%,#a855f7_25%,#6366f1_50%,#a855f7_75%,#c084fc_100%)]"></div>
        </div>
        
        {/* Inner Border Mask (Ensures glow is only at edges) */}
        <div className={`absolute inset-[1.5px] rounded-full z-1 ${variant === 'primary' ? 'bg-white' : 'bg-purple-950/90'}`}></div>

        {/* DESIGN SPELL 2: Liquid Magnetic Fill */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-100 z-2"
          style={{
            background: `radial-gradient(150px circle at ${cursorPos.x}% ${cursorPos.y}%, ${
              variant === 'primary' 
                ? 'rgba(168, 85, 247, 0.15)' 
                : 'rgba(255, 255, 255, 0.15)'
            } 0%, transparent 100%)`
          }}
        />

        {/* DESIGN SPELL 3: Grainy Premium Texture */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-3"></div>

        {/* Button Content */}
        <motion.span 
          className="relative z-10 flex items-center justify-center gap-2 px-1 py-1"
          animate={{
            scale: isHovered ? 1.05 : 1,
            rotate: isHovered ? 0.5 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {children}
        </motion.span>
      </a>

      {/* DESIGN SPELL 4: Shadow Bloom */}
      <div className={`absolute -inset-4 opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none blur-2xl rounded-full ${variant === 'primary' ? 'bg-white' : 'bg-purple-500'}`}></div>
    </motion.div>
  );
};

export default MagneticButton;
