import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LOGO_URL from '../../assets/images/CashCrowLogo.png';

const colors = {
  midnightBlue: '#1F3B4D',
  stoneGray: '#8A8D91',
  darkSageGreen: '#4E6A58',
};

type ColorKey = keyof typeof colors;

const ROWS = 20;
const COLS = 25;

const ravenShapePoints: [number, number, ColorKey][] = [
  [4, 12, 'midnightBlue'], [4, 13, 'midnightBlue'],
  [5, 11, 'midnightBlue'], [5, 12, 'midnightBlue'], [5, 13, 'midnightBlue'], [5, 14, 'midnightBlue'],
  [6, 10, 'stoneGray'], [6, 15, 'stoneGray'],
  [7, 9, 'stoneGray'], [7, 16, 'stoneGray'],
  [8, 9, 'darkSageGreen'], [8, 10, 'darkSageGreen'], [8, 11, 'darkSageGreen'], [8, 12, 'darkSageGreen'],
  [8, 13, 'darkSageGreen'], [8, 14, 'darkSageGreen'], [8, 15, 'darkSageGreen'], [8, 16, 'darkSageGreen'],
  [9, 8, 'darkSageGreen'], [9, 9, 'darkSageGreen'], [9, 10, 'darkSageGreen'], [9, 11, 'darkSageGreen'], 
  [9, 12, 'darkSageGreen'], [9, 13, 'darkSageGreen'], [9, 14, 'darkSageGreen'], [9, 15, 'darkSageGreen'], 
  [9, 16, 'darkSageGreen'], [9, 17, 'darkSageGreen'],
  [10, 7, 'stoneGray'], [10, 8, 'stoneGray'], [10, 9, 'stoneGray'], [10, 10, 'stoneGray'], 
  [10, 11, 'stoneGray'], [10, 12, 'stoneGray'], [10, 13, 'stoneGray'], [10, 14, 'stoneGray'], 
  [10, 15, 'stoneGray'], [10, 16, 'stoneGray'], [10, 17, 'stoneGray'], [10, 18, 'stoneGray'],
  [11, 6, 'midnightBlue'], [11, 7, 'midnightBlue'], [11, 8, 'midnightBlue'], [11, 9, 'midnightBlue'], 
  [11, 16, 'midnightBlue'], [11, 17, 'midnightBlue'], [11, 18, 'midnightBlue'], [11, 19, 'midnightBlue'],
  [12, 5, 'midnightBlue'], [12, 6, 'midnightBlue'], [12, 7, 'midnightBlue'],
  [12, 18, 'midnightBlue'], [12, 19, 'midnightBlue'], [12, 20, 'midnightBlue'],
  [13, 4, 'stoneGray'], [13, 5, 'stoneGray'], [13, 6, 'stoneGray'], 
  [13, 19, 'stoneGray'], [13, 20, 'stoneGray'], [13, 21, 'stoneGray'],
  [14, 3, 'darkSageGreen'], [14, 4, 'darkSageGreen'], [14, 5, 'darkSageGreen'], 
  [14, 20, 'darkSageGreen'], [14, 21, 'darkSageGreen'], [14, 22, 'darkSageGreen'],
  [15, 2, 'darkSageGreen'], [15, 3, 'darkSageGreen'], [15, 4, 'darkSageGreen'], 
  [15, 21, 'darkSageGreen'], [15, 22, 'darkSageGreen'], [15, 23, 'darkSageGreen'],
  [16, 1, 'stoneGray'], [16, 2, 'stoneGray'], [16, 3, 'stoneGray'], 
  [16, 22, 'stoneGray'], [16, 23, 'stoneGray'], [16, 24, 'stoneGray'],
];

interface PointProps {
  color: string;
  visible: boolean;
  size: number | string;
  usePixels?: boolean;
}

const Point: React.FC<PointProps> = ({ color, visible, size, usePixels = false }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: visible ? 1 : 0.2, scale: visible ? 1 : 0.7 }}
    transition={{ duration: 0.3 }}
    style={{
      width: usePixels ? `${size}px` : `${size}rem`,
      height: usePixels ? `${size}px` : `${size}rem`,
      borderRadius: '50%',
      backgroundColor: color,
      margin: usePixels ? '2px' : `${Number(size) * 0.15}rem`,
      boxShadow: visible ? (usePixels ? `0 0 8px ${color}` : `0 0 ${Number(size) * 0.5}rem ${color}`) : 'none'
    }}
  />
);

interface RavenGridAnimationProps {
  size?: 'small' | 'medium' | 'large' | 'custom' | 'original';
  customSize?: number;
  containerWidth?: string;
}

const RavenGridAnimation: React.FC<RavenGridAnimationProps> = ({ 
  size = 'medium', 
  customSize = 100,
  containerWidth = 'fit-content'
}) => {
  const [visiblePoints, setVisiblePoints] = useState<boolean[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(false))
  );

  const [showLogo, setShowLogo] = useState(false);

  const animationRef = useRef({
    currentIndex: 0,
    interval: null as NodeJS.Timeout | null,
    isReversing: false
  });

  const getSizeValues = () => {
    switch(size) {
      case 'small':
        return { pointSize: 0.5, gap: 0.1, padding: 0.2, logoWidth: '100px', usePixels: false };
      case 'large':
        return { pointSize: 1, gap: 0.2, padding: 0.4, logoWidth: '250px', usePixels: false };
      case 'custom':
        return { 
          pointSize: customSize / 100, 
          gap: customSize / 500, 
          padding: customSize / 250, 
          logoWidth: `${customSize * 3}px`,
          usePixels: false
        };
      case 'medium':
      default:
        return { pointSize: 0.75, gap: 0.15, padding: 0.3, logoWidth: '100px', usePixels: false };
    }
  };

  const { pointSize, gap, padding, logoWidth, usePixels } = getSizeValues();

  const resetGrid = () => {
    setVisiblePoints(Array(ROWS).fill(null).map(() => Array(COLS).fill(false)));
  };

  useEffect(() => {
    const animatePoints = () => {
      animationRef.current.interval = setInterval(() => {
        if (!animationRef.current.isReversing) {
          if (animationRef.current.currentIndex >= ravenShapePoints.length) {
            clearInterval(animationRef.current.interval!);
            setTimeout(() => {
              setTimeout(() => {
                animationRef.current.isReversing = true;
                animationRef.current.currentIndex = ravenShapePoints.length - 1;
                animatePoints();
              }, 800);
            }, 300);
            return;
          }

          setVisiblePoints(prev => {
            const newVisible = prev.map(row => [...row]);
            const point = ravenShapePoints[animationRef.current.currentIndex];
            if (point) {
              const [r, c] = point;
              newVisible[r][c] = true;
            }
            return newVisible;
          });

          // Afficher le logo plus tôt (ex: après 35 points)
          if (animationRef.current.currentIndex === 35 && !showLogo) {
            setShowLogo(true);
          }

          animationRef.current.currentIndex++;
        } else {
          if (animationRef.current.currentIndex < 0) {
            clearInterval(animationRef.current.interval!);
            setTimeout(() => {
              setShowLogo(false);
              resetGrid();
              animationRef.current.isReversing = false;
              animationRef.current.currentIndex = 0;
              animatePoints();
            }, 300);
            return;
          }

          setVisiblePoints(prev => {
            const newVisible = prev.map(row => [...row]);
            const point = ravenShapePoints[animationRef.current.currentIndex];
            if (point) {
              const [r, c] = point;
              newVisible[r][c] = false;
            }
            return newVisible;
          });

          animationRef.current.currentIndex--;
        }
      }, 6); // Beaucoup plus rapide
    };

    animatePoints();

    return () => {
      if (animationRef.current.interval) {
        clearInterval(animationRef.current.interval);
      }
    };
  }, [showLogo]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: containerWidth,
        margin: '0 auto',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: usePixels 
            ? `repeat(${COLS}, ${pointSize}px)` 
            : `repeat(${COLS}, ${pointSize}rem)`,
          gridTemplateRows: usePixels 
            ? `repeat(${ROWS}, ${pointSize}px)` 
            : `repeat(${ROWS}, ${pointSize}rem)`,
          justifyContent: 'center',
          alignContent: 'center',
          gap: usePixels ? `${gap}px` : `${gap}rem`,
          backgroundColor: colors.midnightBlue,
          padding: usePixels ? `${padding}px` : `${padding}rem`,
          borderRadius: 2,
          width: '100%',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            const pointIndex = ravenShapePoints.findIndex(([r, c]) => r === row && c === col);
            const isVisible = pointIndex !== -1 && visiblePoints[row][col];
            const colorKey = pointIndex !== -1 ? ravenShapePoints[pointIndex][2] : 'stoneGray';
            const color = colors[colorKey];
            return (
              <Point 
                key={`${row}-${col}`} 
                color={color} 
                visible={isVisible} 
                size={pointSize}
                usePixels={usePixels}
              />
            );
          })
        )}
      </Box>

      <AnimatePresence>
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              zIndex: 10,
              textAlign: 'center'
            }}
          >
            <img 
              src={LOGO_URL} 
              alt="CASHCROW" 
              style={{ 
                width: logoWidth,
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default RavenGridAnimation;
