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
  IconButton,
  Grid as MuiGrid,
  Divider,
  InputAdornment,
  Tooltip,
  Alert,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { Template, OrderTemplate } from '../../models/Template';
import { useTemplates } from '../../context/TemplateContext';
import DynamicTypography from '../common/DynamicTypography';
import AnimatedButton from '../common/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';
import MicroInteraction from '../common/MicroInteraction';
import { styled } from '@mui/material/styles';

const Grid = styled(MuiGrid)<any>({});

interface TemplateFormProps {
  initialTemplate?: Template;
  onSave?: (template: Template) => void;
  onCancel?: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  initialTemplate,
  onSave,
  onCancel
}) => {
  const theme = useTheme();
  const { saveTemplate, updateTemplate } = useTemplates();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // État du formulaire
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'both'>('both');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [orders, setOrders] = useState<OrderTemplate[]>([]);
  
  // Initialiser le formulaire avec les valeurs du template si fourni
  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setDate(initialTemplate.date);
      setPaymentMethod(initialTemplate.paymentMethod);
      setTotalAmount(initialTemplate.totalAmount);
      setOrders([...initialTemplate.orders]);
    } else {
      // Ajouter une commande vide par défaut
      setOrders([
        { id: uuidv4(), amount: 0, frequency: 1 }
      ]);
    }
  }, [initialTemplate]);
  
  // Calculer le total des commandes
  const calculatedTotal = orders.reduce(
    (sum, order) => sum + (order.amount * order.frequency), 
    0
  );
  
  // Vérifier si le total calculé correspond au total saisi
  const totalMismatch = Math.abs(calculatedTotal - totalAmount) > 0.01;
  
  // Ajouter une nouvelle commande
  const handleAddOrder = () => {
    setOrders([...orders, { id: uuidv4(), amount: 0, frequency: 1 }]);
  };
  
  // Supprimer une commande
  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };
  
  // Mettre à jour une commande
  const handleOrderChange = (id: string, field: keyof OrderTemplate, value: any) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    ));
  };
  
  // Recalculer le total à partir des commandes
  const handleRecalculateTotal = () => {
    setTotalAmount(calculatedTotal);
  };
  
  // Valider et soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!name.trim()) {
      setError('Le nom du template est requis');
      return;
    }
    
    if (orders.length === 0) {
      setError('Au moins une commande est requise');
      return;
    }
    
    if (orders.some(order => order.amount <= 0)) {
      setError('Toutes les commandes doivent avoir un montant positif');
      return;
    }
    
    if (orders.some(order => order.frequency <= 0)) {
      setError('Toutes les commandes doivent avoir une fréquence positive');
      return;
    }
    
    // Créer ou mettre à jour le template
    try {
      const templateData = {
        name,
        date,
        paymentMethod,
        totalAmount,
        orders
      };
      
      let savedTemplate: Template | null;
      
      if (initialTemplate) {
        savedTemplate = await updateTemplate(initialTemplate.id, templateData);
        if (savedTemplate) {
          setSuccess('Template mis à jour avec succès');
        }
      } else {
        savedTemplate = await saveTemplate(templateData);
        setSuccess('Template créé avec succès');
        
        // Réinitialiser le formulaire
        setName('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('both');
        setTotalAmount(0);
        setOrders([{ id: uuidv4(), amount: 0, frequency: 1 }]);
      }
      
      if (savedTemplate && onSave) {
        onSave(savedTemplate);
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du template:', err);
      setError('Une erreur est survenue lors de la sauvegarde');
    }
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
          {initialTemplate ? 'Modifier le template' : 'Créer un nouveau template'}
        </DynamicTypography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom du template"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Méthode de paiement</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'both')}
                  label="Méthode de paiement"
                >
                  <MenuItem value="cash">Espèces</MenuItem>
                  <MenuItem value="card">Carte bancaire</MenuItem>
                  <MenuItem value="both">Les deux</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid component="div" item xs={12} sm={6}>
              <TextField
                label="Montant total"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Recalculer à partir des commandes">
                        <IconButton 
                          edge="end" 
                          onClick={handleRecalculateTotal}
                          size="small"
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                error={totalMismatch}
                helperText={totalMismatch ? `Total calculé: ${calculatedTotal.toFixed(2)} €` : ''}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <DynamicTypography variant="h6">Commandes</DynamicTypography>
                <AnimatedButton
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddOrder}
                  size="small"
                >
                  Ajouter une commande
                </AnimatedButton>
              </Box>
              
              <AnimatePresence>
                {orders.map((order, index) => (
                  <MicroInteraction
                    key={order.id}
                    type="scale"
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        mb: 2, 
                        p: 2, 
                        borderRadius: 1,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(0, 0, 0, 0.1)' 
                          : 'rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      <TextField
                        label="Montant"
                        type="number"
                        value={order.amount}
                        onChange={(e) => handleOrderChange(
                          order.id, 
                          'amount', 
                          parseFloat(e.target.value) || 0
                        )}
                        required
                        variant="outlined"
                        size="small"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">€</InputAdornment>,
                        }}
                        sx={{ flex: 1 }}
                      />
                      
                      <TextField
                        label="Fréquence"
                        type="number"
                        value={order.frequency}
                        onChange={(e) => handleOrderChange(
                          order.id, 
                          'frequency', 
                          parseInt(e.target.value) || 0
                        )}
                        required
                        variant="outlined"
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      
                      <TextField
                        label="Description (optionnelle)"
                        value={order.description || ''}
                        onChange={(e) => handleOrderChange(order.id, 'description', e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ flex: 2 }}
                      />
                      
                      <IconButton 
                        onClick={() => handleDeleteOrder(order.id)}
                        color="error"
                        disabled={orders.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </MicroInteraction>
                ))}
              </AnimatePresence>
            </Grid>
            
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            
            {success && (
              <Grid item xs={12}>
                <Alert severity="success">{success}</Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                {onCancel && (
                  <Button 
                    variant="outlined" 
                    onClick={onCancel}
                  >
                    Annuler
                  </Button>
                )}
                
                <AnimatedButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  haloEffect
                >
                  {initialTemplate ? 'Mettre à jour' : 'Enregistrer'}
                </AnimatedButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemplateForm;
