import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  IconButton,
  styled
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as GenerateIcon,
  CalendarMonth as CalendarIcon,
  Euro as EuroIcon,
  CreditCard as CardIcon,
  Money as CashIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { format, addDays, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Template } from '../../models/Template';
import { DailyReportGenerationParams, AlgorithmSettings } from '../../models/DailyReport';
import { useTemplates } from '../../context/TemplateContext';
import { useGeneration } from '../../context/GenerationContext';
import DynamicTypography from '../common/DynamicTypography';
import AnimatedButton from '../common/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';
import MicroInteraction from '../common/MicroInteraction';
import GenerationProgress from './GenerationProgress';
import { default as AlgorithmSettingsComponent } from './AlgorithmSettings';
import { PaymentMethod } from '../../models/Order';

const Grid = styled('div')<any>({
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  gap: 16
});

const GridItem = styled('div')<{xs?: number, sm?: number}>(({ xs = 12, sm = xs }) => ({
  gridColumn: `span ${xs}`,
  '@media (min-width: 600px)': {
    gridColumn: `span ${sm}`
  }
}));

interface GenerationFormProps {
  onGenerationComplete?: () => void;
}

// Interface pour les entrées de génération
interface GenerationEntry {
  id: string;
  date: Date | null;
  targetAmount: string;
  paymentMethod: PaymentMethod;
  templateIds: string[];
}

const GenerationForm: React.FC<GenerationFormProps> = ({
  onGenerationComplete
}) => {
  const theme = useTheme();
  const { templates } = useTemplates();
  const { 
    generateMultipleReports, 
    generating, 
    progress, 
    defaultAlgorithmSettings,
    updateAlgorithmSettings
  } = useGeneration();
  
  // État du formulaire
  const [entries, setEntries] = useState<GenerationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [algorithmSettings, setAlgorithmSettings] = useState<AlgorithmSettings>(defaultAlgorithmSettings);
  const [processMessage, setProcessMessage] = useState<string>("Initializing...");

  // Initialiser avec une entrée vide
  useEffect(() => {
    if (entries.length === 0) {
      setEntries([{
        id: uuidv4(),
        date: new Date(),
        targetAmount: '',
        paymentMethod: 'both',
        templateIds: []
      }]);
    }
  }, []);
  
  // Ajouter une nouvelle entrée
  const handleAddEntry = () => {
    setEntries([...entries, {
      id: uuidv4(),
      date: entries.length > 0 ? addDays(entries[entries.length - 1].date || new Date(), 1) : new Date(),
      targetAmount: '',
      paymentMethod: 'both',
      templateIds: []
    }]);
  };
  
  // Supprimer une entrée
  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  // Mettre à jour une entrée
  const handleEntryChange = (id: string, field: keyof GenerationEntry, value: any) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };
  
  // Gérer les changements dans les paramètres de l'algorithme
  const handleAlgorithmSettingsChange = (newSettings: Partial<AlgorithmSettings>) => {
    setAlgorithmSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  
  // Valider les entrées
  const validateEntries = (): boolean => {
    if (entries.length === 0) {
      setError('Ajoutez au moins une entrée pour générer des rapports');
      return false;
    }
    
    for (const entry of entries) {
      if (!entry.date || !isValid(entry.date)) {
        setError('Toutes les dates doivent être valides');
        return false;
      }
      
      if (!entry.targetAmount || isNaN(parseFloat(entry.targetAmount)) || parseFloat(entry.targetAmount) <= 0) {
        setError('Tous les montants doivent être des nombres positifs');
        return false;
      }
      
      if (entry.templateIds.length === 0) {
        setError('Sélectionnez au moins un template pour chaque entrée');
        return false;
      }
    }
    
    return true;
  };
  
  // Générer les rapports
  const handleGenerate = async () => {
    setError(null);
    
    if (!validateEntries()) {
      return;
    }
    
    try {
      // Préparer les paramètres de génération
      const params: DailyReportGenerationParams[] = entries.map(entry => ({
        date: format(entry.date!, 'yyyy-MM-dd'),
        targetAmount: parseFloat(entry.targetAmount),
        paymentMethod: entry.paymentMethod,
        templateIds: entry.templateIds,
        algorithmSettings
      }));
      
      // Générer les rapports
      await generateMultipleReports(params);
      
      // Mettre à jour les paramètres d'algorithme par défaut
      updateAlgorithmSettings(algorithmSettings);
      
      // Notifier que la génération est terminée
      if (onGenerationComplete) {
        onGenerationComplete();
      }
      
      // Réinitialiser le formulaire
      setEntries([{
        id: uuidv4(),
        date: new Date(),
        targetAmount: '',
        paymentMethod: 'both',
        templateIds: []
      }]);
      
    } catch (err) {
      console.error('Erreur lors de la génération des rapports:', err);
      setError('Une erreur est survenue lors de la génération des rapports');
    }
  };
  
  // Étapes du processus de génération
  const steps = [
    'Configuration des entrées',
    'Paramètres avancés',
    'Génération'
  ];
  
  // Passer à l'étape suivante
  const handleNext = () => {
    if (activeStep === 0 && !validateEntries()) {
      return;
    }
    
    setActiveStep(prevStep => prevStep + 1);
  };
  
  // Revenir à l'étape précédente
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      elevation={3}
      sx={{
        overflow: 'visible',
        background: theme.palette.mode === 'dark'
          ? 'rgba(31, 41, 55, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2
      }}
    >
      <CardContent>
        <DynamicTypography
          variant="h5"
          gutterBottom
          animationType="slide"
        >
          Générer des bilans journaliers
        </DynamicTypography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                Configurez les dates, montants et templates pour chaque bilan journalier à générer.
              </Typography>
              
              <AnimatedButton
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddEntry}
                sx={{ mt: 1 }}
              >
                Ajouter une entrée
              </AnimatedButton>
            </Box>
            
            <AnimatePresence>
              {entries.map((entry, index) => (
                <MicroInteraction
                  key={entry.id}
                  type="scale"
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Entrée #{index + 1}
                      </Typography>
                      
                      <IconButton
                        onClick={() => handleDeleteEntry(entry.id)}
                        color="error"
                        disabled={entries.length <= 1}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Grid>
                      <GridItem xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                          <DatePicker
                            label="Date"
                            value={entry.date}
                            onChange={(newDate) => handleEntryChange(entry.id, 'date', newDate)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                variant: "outlined",
                                error: !entry.date || !isValid(entry.date)
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </GridItem>
                      
                      <GridItem xs={12} sm={4}>
                        <TextField
                          label="Montant total"
                          value={entry.targetAmount}
                          onChange={(e) => handleEntryChange(entry.id, 'targetAmount', e.target.value)}
                          fullWidth
                          required
                          variant="outlined"
                          type="number"
                          InputProps={{
                            startAdornment: <EuroIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
                          }}
                          error={!entry.targetAmount || isNaN(parseFloat(entry.targetAmount)) || parseFloat(entry.targetAmount) <= 0}
                        />
                      </GridItem>
                      
                      <GridItem xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Méthode de paiement</InputLabel>
                          <Select
                            value={entry.paymentMethod}
                            onChange={(e) => handleEntryChange(entry.id, 'paymentMethod', e.target.value)}
                            label="Méthode de paiement"
                          >
                            <MenuItem value="cash">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CashIcon fontSize="small" sx={{ mr: 1 }} />
                                Espèces
                              </Box>
                            </MenuItem>
                            <MenuItem value="card">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CardIcon fontSize="small" sx={{ mr: 1 }} />
                                Carte bancaire
                              </Box>
                            </MenuItem>
                            <MenuItem value="both">Les deux</MenuItem>
                          </Select>
                        </FormControl>
                      </GridItem>
                      
                      <GridItem xs={12}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Templates à utiliser</InputLabel>
                          <Select
                            multiple
                            value={entry.templateIds}
                            onChange={(e) => handleEntryChange(entry.id, 'templateIds', e.target.value)}
                            label="Templates à utiliser"
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as string[]).map((templateId) => {
                                  const template = templates.find(t => t.id === templateId);
                                  return (
                                    <Chip 
                                      key={templateId} 
                                      label={template?.name || 'Template inconnu'} 
                                      size="small" 
                                    />
                                  );
                                })}
                              </Box>
                            )}
                          >
                            {templates.map((template) => (
                              <MenuItem key={template.id} value={template.id}>
                                <Checkbox checked={entry.templateIds.indexOf(template.id) > -1} />
                                <Typography>{template.name}</Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </Box>
                </MicroInteraction>
              ))}
            </AnimatePresence>
          </>
        )}
        
        {activeStep === 1 && (
          <AlgorithmSettingsComponent
            settings={algorithmSettings}
            onChange={handleAlgorithmSettingsChange}
          />
        )}
        
        {activeStep === 2 && (
          <GenerationProgress
            entries={entries.length}
            progress={progress}
            generating={generating}
            processMessage={processMessage}
          />
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Retour
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <AnimatedButton
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                startIcon={<GenerateIcon />}
                disabled={generating}
                haloEffect
              >
                {generating ? 'Génération en cours...' : 'Générer les rapports'}
              </AnimatedButton>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GenerationForm;
