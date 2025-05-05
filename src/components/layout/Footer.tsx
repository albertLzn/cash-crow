import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component={motion.footer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        textAlign: 'center',
        borderTop: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(10px)',
        background: 'transparent',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {currentYear} CashCrow - AI-powered ledger filler.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Développé avec ❤️ pour simplifier la génération de bilans journaliers
      </Typography>
    </Box>
  );
};

export default Footer;
