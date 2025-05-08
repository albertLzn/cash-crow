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
  useTheme,
  Switch,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CreditCard,
  Money
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { Template, OrderTemplate } from '../../models/Template';
import { useTemplates } from '../../context/TemplateContext';
import DynamicTypography from '../common/DynamicTypography';
import AnimatedButton from '../common/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';
import MicroInteraction from '../common/MicroInteraction';
import { styled } from '@mui/material/styles';
import { PaymentMethod } from '../../models/Order';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('both');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [orders, setOrders] = useState<OrderTemplate[]>([]);
  
  // Nouveaux états pour les champs ajoutés
  const [maxCashAmount, setMaxCashAmount] = useState<number>(100); // Valeur par défaut
  const [minCardAmount, setMinCardAmount] = useState<number>(5); // Valeur par défaut
  const [maxOperationsPerDay, setMaxOperationsPerDay] = useState<number>(50); // Valeur par défaut
  const [isProRepro, setIsProRepro] = useState<boolean>(true); // Valeur par défaut
  
  // Initialiser le formulaire avec les valeurs du template si fourni
  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setDate(initialTemplate.date);
      setPaymentMethod(initialTemplate.paymentMethod);
      setTotalAmount(initialTemplate.totalAmount);
      setOrders([...initialTemplate.orders]);
      
      // Initialiser les nouveaux champs
      setMaxCashAmount(initialTemplate.maxCashAmount || 100);
      setMinCardAmount(initialTemplate.minCardAmount || 5);
      setMaxOperationsPerDay(initialTemplate.maxOperationsPerDay || 50);
      setIsProRepro(initialTemplate.isProRepro !== undefined ? initialTemplate.isProRepro : true);
    } else {
      // Ajouter une commande vide par défaut
      setOrders([
        { id: uuidv4(), amount: 0, frequency: 1, paymentMethod: 'cash' }
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
    setOrders([...orders, { id: uuidv4(), amount: 0, frequency: 1, paymentMethod: 'cash' }]);
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
  
    // 🧠 Déduire automatiquement le type de paiement global
    const paymentTypes = new Set(orders.map(order => order.paymentMethod));
    const inferredPaymentMethod: PaymentMethod = paymentTypes.size > 1
      ? 'both'
      : paymentTypes.has('cash')
        ? 'cash'
        : 'card';
  
    // Créer ou mettre à jour le template
    try {
      const templateData = {
        name,
        date,
        paymentMethod: inferredPaymentMethod,
        totalAmount,
        orders,
        // Ajouter les nouveaux champs
        maxCashAmount,
        minCardAmount,
        maxOperationsPerDay,
        isProRepro
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
        setOrders([{ id: uuidv4(), amount: 0, frequency: 1, paymentMethod: 'cash' as PaymentMethod}]);
        // Réinitialiser les nouveaux champs
        setMaxCashAmount(100);
        setMinCardAmount(5);
        setMaxOperationsPerDay(50);
        setIsProRepro(true);
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
                  onChange={(e) => {
                    const newPaymentMethod = e.target.value as 'cash' | 'card' | 'both';
                    setPaymentMethod(newPaymentMethod);
                    
                    // Ne mettre à jour les items que si la méthode n'est pas "both"
                    if (newPaymentMethod !== 'both') {
                      const updatedOrders = orders.map(order => ({
                        ...order,
                        paymentMethod: newPaymentMethod
                      }));
                      
                      setOrders(updatedOrders);
                    }
                  }}
                  label="Méthode de paiement"
                >
                  <MenuItem value="cash">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Money sx={{ mr: 1 }} />
                      Espèces
                    </Box>
                  </MenuItem>
                  <MenuItem value="card">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ mr: 1 }} />
                      Carte bancaire
                    </Box>
                  </MenuItem>
                  <MenuItem value="both">Les deux</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
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
            
            {/* Nouveaux champs ajoutés */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Paramètres avancés
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant maximum en espèces"
                type="number"
                value={maxCashAmount}
                onChange={(e) => setMaxCashAmount(parseFloat(e.target.value) || 0)}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
                helperText="Montant maximum autorisé pour les paiements en espèces"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Montant minimum en carte"
                type="number"
                value={minCardAmount}
                onChange={(e) => setMinCardAmount(parseFloat(e.target.value) || 0)}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
                helperText="Montant minimum autorisé pour les paiements par carte"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre maximum d'opérations par jour"
                type="number"
                value={maxOperationsPerDay}
                onChange={(e) => setMaxOperationsPerDay(parseInt(e.target.value) || 0)}
                fullWidth
                variant="outlined"
                helperText="Limite le nombre de transactions générées par jour"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isProRepro}
                      onChange={(e) => setIsProRepro(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Utiliser la reproduction professionnelle"
                />
                <Typography variant="caption" color="text.secondary">
                  Attribue automatiquement des catégories aux commandes en fonction de leur montant
                </Typography>
              </FormGroup>
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

                      <FormControl variant="outlined" size="small" sx={{ flex: 1 }}>
                        <InputLabel id={`payment-method-label-${order.id}`}>Paiement</InputLabel>
                        <Select
                          labelId={`payment-method-label-${order.id}`}
                          id={`payment-method-${order.id}`}
                          value={order.paymentMethod || 'cash'}
                          onChange={(e) => handleOrderChange(order.id, 'paymentMethod', e.target.value)}
                          label="Paiement"
                        >
                          <MenuItem value="card">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CreditCard sx={{ mr: 1 }} fontSize="small" />
                              Carte
                            </Box>
                          </MenuItem>
                          <MenuItem value="cash">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Money sx={{ mr: 1 }} fontSize="small" />
                              Espèces
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      
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
