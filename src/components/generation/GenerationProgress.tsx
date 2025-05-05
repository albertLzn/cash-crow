import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  useTheme,
} from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import RavenGridAnimation from '../common/RavenGridAnimation'; // Importez votre composant d'animation
import { ProcessEvent } from '../../services/generationService';

interface GenerationProgressProps {
  entries: number;
  progress: number;
  generating: boolean;
  processMessage?: string;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  entries,
  progress,
  generating,
  processMessage = "Processing..."
}) => {
  const theme = useTheme();
  const controls = useAnimation();
  
  // Animation quand la génération est terminée
  useEffect(() => {
    if (progress === 100 && !generating) {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.5 }
      });
    }
  }, [progress, generating, controls]);
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Typography variant="h6" gutterBottom>
        Génération des bilans journaliers
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        {generating
          ? `Génération en cours pour ${entries} jour${entries > 1 ? 's' : ''}...`
          : progress === 100
            ? `${entries} bilan${entries > 1 ? 's' : ''} généré${entries > 1 ? 's' : ''} avec succès !`
            : 'Prêt à générer les bilans journaliers.'
        }
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 3, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300
        }}
      >
        {generating || progress > 0 ? (
          <>
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  0%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  100%
                </Typography>
              </Box>
            </Box>
            
            {generating ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
     <Box sx={{ mb: 3, width: '100%', maxWidth: 180, height: 'auto' }}>
  <Box sx={{ width: '100%' }}>
  <RavenGridAnimation size="small" containerWidth="100%" />
  </Box>
</Box>
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
                  {processMessage}
                </Typography>
              </Box>
            ) : progress === 100 ? (
              <Box 
                component={motion.div}
                animate={controls}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: theme.palette.success.main
                }}
              >
                <CheckCircleIcon sx={{ mr: 2, fontSize: 30 }} />
                <Typography variant="h6" color="success.main">
                  Génération terminée !
                </Typography>
              </Box>
            ) : null}
          </>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              Cliquez sur "Générer les rapports" pour commencer le processus de génération.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              L'algorithme va analyser les templates sélectionnés et générer des bilans journaliers détaillés.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GenerationProgress;
