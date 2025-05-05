import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CreditCard as CardIcon,
  Money as CashIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Template } from '../../models/Template';
import { motion } from 'framer-motion';

interface TemplateItemProps {
  template: Template;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({
  template,
  onSelect,
  onEdit,
  onDelete,
  onContextMenu
}) => {
  const theme = useTheme();
  
  // Formater la date
  const formattedDate = format(new Date(template.date), 'dd MMMM yyyy', { locale: fr });
  
  // Déterminer l'icône de méthode de paiement
  const getPaymentMethodIcon = () => {
    switch (template.paymentMethod) {
      case 'cash':
        return <CashIcon fontSize="small" />;
      case 'card':
        return <CardIcon fontSize="small" />;
      case 'both':
        return (
          <>
            <CashIcon fontSize="small" sx={{ mr: 0.5 }} />
            <CardIcon fontSize="small" />
          </>
        );
      default:
        return <></>;  // Retourner un fragment vide au lieu de null
    }
  };
  
  
  // Obtenir le libellé de la méthode de paiement
  const getPaymentMethodLabel = () => {
    switch (template.paymentMethod) {
      case 'cash':
        return 'Espèces';
      case 'card':
        return 'Carte bancaire';
      case 'both':
        return 'Espèces & Carte';
      default:
        return '';
    }
  };
  
  // Calculer le nombre total de commandes
  const totalOrders = template.orders.reduce((sum, order) => sum + order.frequency, 0);
  
  return (
    <Card
      component={motion.div}
      whileHover={{ 
        boxShadow: theme.shadows[4],
        translateY: -2
      }}
      transition={{ duration: 0.2 }}
      sx={{
        cursor: 'pointer',
        borderLeft: `4px solid ${theme.palette.primary.main}`,
      }}
      onClick={onSelect}
      onContextMenu={onContextMenu}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {template.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {formattedDate}
              </Typography>
              
              <Chip
                icon={getPaymentMethodIcon()}
                label={getPaymentMethodLabel()}
                size="small"
                color={
                  template.paymentMethod === 'cash' ? 'success' :
                  template.paymentMethod === 'card' ? 'info' : 'default'
                }
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Box>
            <Tooltip title="Modifier">
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Supprimer">
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {totalOrders} commande{totalOrders > 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Typography variant="h6" color="primary">
            {template.totalAmount.toFixed(2)} €
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemplateItem;
