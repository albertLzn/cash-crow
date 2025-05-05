import React, { ReactNode, useState, useEffect } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import RavenGridAnimation from '../common/RavenGridAnimation'; // Importez votre composant d'animation

interface MainLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  withBackground?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  maxWidth = 'lg',
  withBackground = false
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); 
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.palette.background.default,
              zIndex: 9999
            }}
          >
<RavenGridAnimation size="large" containerWidth="fit-content" />
</motion.div>
        ) : null}
      </AnimatePresence>
      
      <Header />
      
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: loading ? 0 : 1, y: loading ? 20 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{
          flexGrow: 1,
          py: 4,
          px: { xs: 2, sm: 3 },
          visibility: loading ? 'hidden' : 'visible',
        }}
      >
        <Container maxWidth={maxWidth}>
          {children}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default MainLayout;
