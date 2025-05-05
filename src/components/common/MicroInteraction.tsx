import React from 'react';
import { motion, MotionProps, HTMLMotionProps } from 'framer-motion';

interface MicroInteractionProps {
  type?: 'scale' | 'fade' | 'slide';
  children: React.ReactNode;
  component?: React.ElementType;
  [key: string]: any; // Pour permettre d'autres props
}

const MicroInteraction: React.FC<MicroInteractionProps> = ({
  type = 'scale',
  children,
  component = motion.div,
  ...motionProps
}) => {
  let variants = {};
  switch (type) {
    case 'fade':
      variants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
      break;
    case 'slide':
      variants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      };
      break;
    case 'scale':
    default:
      variants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
      };
      break;
  }

  // Utiliser createElement au lieu de JSX pour éviter les problèmes de typage
  return React.createElement(
    component,
    {
      initial: "initial",
      animate: "animate",
      exit: "exit",
      variants,
      ...motionProps
    },
    children
  );
};

export default MicroInteraction;
