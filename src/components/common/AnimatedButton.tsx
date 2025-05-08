import React, { useState } from 'react';
import { Button, ButtonProps, alpha, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { useAppTheme } from '../../context/ThemeContext';

const MotionButtonWrapper = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const Halo = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  borderRadius: theme.shape.borderRadius,
  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
  opacity: 0,
}));

interface AnimatedButtonProps extends ButtonProps {
  haloEffect?: boolean;
  pulseEffect?: boolean;
  hoverScale?: number;
  tapScale?: number;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  haloEffect = true,
  pulseEffect = false,
  hoverScale = 1.05,
  tapScale = 0.95,
  ...buttonProps
}) => {
  const { animationIntensity } = useAppTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const getAnimationDuration = () => {
    switch (animationIntensity) {
      case 'low': return 0.4;
      case 'high': return 0.2;
      default: return 0.3;
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: hoverScale },
    tap: { scale: tapScale },
  };

  const haloVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 0.6, scale: 1.2 },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  return (
    <MotionButtonWrapper
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={pulseEffect ? "pulse" : "initial"}
      variants={pulseEffect ? pulseVariants : buttonVariants}
      transition={{ duration: getAnimationDuration() }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {haloEffect && (
        <Halo
          variants={haloVariants}
          transition={{ duration: getAnimationDuration() * 1.5 }}
        />
      )}
      <Button
        {...buttonProps}
        sx={{
          position: 'relative',
          zIndex: 1,
          ...buttonProps.sx,
        }}
      >
        {children}
      </Button>
    </MotionButtonWrapper>
  );
};

export default AnimatedButton;
