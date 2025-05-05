import React, { useEffect, useRef } from 'react';
import { Typography, TypographyProps, Box, useTheme, styled } from '@mui/material';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useAppTheme } from '../../context/ThemeContext';
import { useInView } from 'framer-motion';

const MotionTypography = styled(motion.div)({
  display: 'inline-block',
  position: 'relative',
});

const Underline = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  bottom: -2,
  left: 0,
  height: 3,
  width: '100%',
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: 2,
}));

const Text3DWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  transformStyle: 'preserve-3d',
  perspective: '1000px',
}));

const TextShadow = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  left: 2,
  zIndex: -1,
  color: 'transparent',
  WebkitTextStroke: `2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`,
  filter: 'blur(2px)',
}));

interface DynamicTypographyProps extends TypographyProps {
  animated?: boolean;
  animationType?: 'fade' | 'slide' | 'stagger' | '3d';
  underline?: boolean;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

const DynamicTypography: React.FC<DynamicTypographyProps> = ({
  animated = true,
  animationType = 'fade',
  underline = false,
  delay = 0,
  duration,
  children,
  ...typographyProps
}) => {
  const theme = useTheme();
  const { animationIntensity, typographyScale } = useAppTheme();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const getAnimationDuration = () => {
    if (duration) return duration;
    
    const baseDuration = 0.5;
    switch (animationIntensity) {
      case 'low': return baseDuration * 1.5;
      case 'high': return baseDuration * 0.7;
      default: return baseDuration;
    }
  };
  
  useEffect(() => {
    if (isInView && animated) {
      controls.start('visible');
    }
  }, [isInView, controls, animated]);
  
  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: getAnimationDuration(),
        delay 
      }
    }
  };
  
  const slideVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: getAnimationDuration(),
        delay,
        ease: "easeOut"
      }
    }
  };
  
  const underlineVariants: Variants = {
    hidden: { width: 0 },
    visible: { 
      width: '100%',
      transition: { 
        duration: getAnimationDuration() * 1.5,
        delay: delay + getAnimationDuration() * 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const text3DVariants: Variants = {
    hidden: { 
      rotateX: 45,
      rotateY: -15,
      opacity: 0,
    },
    visible: { 
      rotateX: 0,
      rotateY: 0,
      opacity: 1,
      transition: { 
        duration: getAnimationDuration() * 1.2,
        delay,
        ease: "easeOut"
      }
    }
  };
  
  const createStaggerVariants = (text: string): { letter: Variants, container: Variants } => {
    return {
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.03,
            delayChildren: delay,
          }
        }
      },
      letter: {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: getAnimationDuration() * 0.5 }
        }
      }
    };
  };
  
  if (animated && animationType === 'stagger' && typeof children === 'string') {
    const text = children as string;
    const staggerVariants = createStaggerVariants(text);
    
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={staggerVariants.container}
      >
        {Array.from(text).map((letter, index) => (
          <motion.span key={index} variants={staggerVariants.letter}>
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.div>
    );
  }
  
  if (animated && animationType === '3d') {
    return (
      <Text3DWrapper ref={ref}>
        <motion.div
          initial="hidden"
          animate={controls}
          variants={text3DVariants}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Typography {...typographyProps}>
            {children}
          </Typography>
        </motion.div>
        <TextShadow
          initial="hidden"
          animate={controls}
          variants={text3DVariants}
        >
          <Typography {...typographyProps}>
            {children}
          </Typography>
        </TextShadow>
      </Text3DWrapper>
    );
  }
  
  const variants = animationType === 'slide' ? slideVariants : fadeVariants;
  
  return (
    <MotionTypography
      ref={ref}
      initial={animated ? "hidden" : "visible"}
      animate={controls}
      variants={variants}
    >
      <Typography {...typographyProps}>
        {children}
      </Typography>
      
      {underline && (
        <Underline
          initial={animated ? "hidden" : "visible"}
          animate={controls}
          variants={underlineVariants}
        />
      )}
    </MotionTypography>
  );
};

export default DynamicTypography;
