import React from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Info as InfoIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import { AlgorithmSettings as AlgorithmSettingsType } from '../../models/DailyReport';
import DynamicTypography from '../common/DynamicTypography';
import { motion } from 'framer-motion';

interface AlgorithmSettingsProps {
  settings: AlgorithmSettingsType;
  onChange: (settings: Partial<AlgorithmSettingsType>) => void;
}

const AlgorithmSettings: React.FC<AlgorithmSettingsProps> = ({
  settings,
  onChange
}) => {
  const theme = useTheme();
  
  // Réinitialiser les paramètres par défaut
  const handleReset = () => {
    onChange({
      variationFactor: 0.2,
      roundingPrecision: 2,
      preferExactMatch: true,
      allowNewOrderTypes: false,
      maxIterations: 1000
    });
  };
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <DynamicTypography variant="h6" gutterBottom>
          Paramètres avancés de l'algorithme
        </DynamicTypography>
        
        <Tooltip title="Réinitialiser les paramètres par défaut">
          <IconButton onClick={handleReset} size="small">
            <ResetIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Ces paramètres contrôlent le comportement de l'algorithme qui génère les commandes détaillées à partir du montant total.
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Facteur de variation
            </Typography>
            <Tooltip title="Contrôle le degré de variation par rapport aux patterns des templates. Une valeur plus élevée permet plus de diversité dans les commandes générées.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Slider
            value={settings.variationFactor}
            onChange={(_, value) => onChange({ variationFactor: value as number })}
            min={0}
            max={1}
            step={0.05}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' }
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value.toFixed(2)}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Strict (suit exactement les templates)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Flexible (plus de variation)
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Précision d'arrondi
            </Typography>
            <Tooltip title="Nombre de décimales à utiliser pour les montants des commandes.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Slider
            value={settings.roundingPrecision}
            onChange={(_, value) => onChange({ roundingPrecision: value as number })}
            min={0}
            max={4}
            step={1}
            marks={[
              { value: 0, label: '0' },
              { value: 2, label: '2' },
              { value: 4, label: '4' }
            ]}
            valueLabelDisplay="auto"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Nombres entiers
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Plus de précision
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.preferExactMatch}
                onChange={(e) => onChange({ preferExactMatch: e.target.checked })}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Privilégier les correspondances exactes</Typography>
                <Tooltip title="Lorsque possible, l'algorithme essaiera d'utiliser des montants exacts provenant des templates.">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowNewOrderTypes}
                onChange={(e) => onChange({ allowNewOrderTypes: e.target.checked })}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Autoriser de nouveaux types de commandes</Typography>
                <Tooltip title="Permet à l'algorithme de créer des commandes avec des montants qui n'existent pas dans les templates.">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Nombre maximum d'itérations
            </Typography>
            <Tooltip title="Limite le nombre d'itérations de l'algorithme pour éviter les boucles infinies. Une valeur plus élevée peut améliorer la précision mais ralentir le traitement.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Slider
            value={settings.maxIterations}
            onChange={(_, value) => onChange({ maxIterations: value as number })}
            min={100}
            max={5000}
            step={100}
            marks={[
              { value: 100, label: '100' },
              { value: 1000, label: '1000' },
              { value: 5000, label: '5000' }
            ]}
            valueLabelDisplay="auto"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Plus rapide
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Plus précis
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AlgorithmSettings;
