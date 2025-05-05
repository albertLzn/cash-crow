import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid as MuiGrid,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Skeleton,
  styled
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  CreditCard as CardIcon,
  Money as CashIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  SortByAlpha
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Template } from '../../models/Template';
import { useTemplates } from '../../context/TemplateContext';
import DynamicTypography from '../common/DynamicTypography';
import AnimatedButton from '../common/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';
import MicroInteraction from '../common/MicroInteraction';
import TemplateItem from './TemplateItem';
export const Grid = styled(MuiGrid)<any>({});

interface TemplateListProps {
  onSelectTemplate?: (template: Template) => void;
  onEditTemplate?: (template: Template) => void;
  onCreateTemplate?: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  onSelectTemplate,
  onEditTemplate,
  onCreateTemplate
}) => {
  const theme = useTheme();
  const { templates, loading, error, deleteTemplate, fetchTemplates } = useTemplates();
  
  // État local pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'both'>('all');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');
  
  // État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    templateId: string;
  } | null>(null);
  
  // Filtrer et trier les templates
  const filteredTemplates = templates
    .filter(template => {
      // Filtrer par terme de recherche
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrer par méthode de paiement
      const matchesPayment = paymentFilter === 'all' || template.paymentMethod === paymentFilter;
      
      return matchesSearch && matchesPayment;
    })
    .sort((a, b) => {
      // Trier par date ou nom
      switch (sortOrder) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  
  // Gérer l'ouverture du menu de filtres
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // Gérer la fermeture du menu de filtres
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Gérer l'ouverture du menu contextuel
  const handleContextMenu = (event: React.MouseEvent, templateId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      templateId
    });
  };
  
  // Gérer la fermeture du menu contextuel
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };
  
  // Gérer la suppression d'un template
  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        await deleteTemplate(id);
      } catch (err) {
        console.error('Erreur lors de la suppression du template:', err);
      }
    }
    handleContextMenuClose();
  };
  
  // Gérer la duplication d'un template
  const handleDuplicateTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template && onCreateTemplate) {
      // TODO: Implémenter la duplication
      console.log('Duplication du template:', template);
    }
    handleContextMenuClose();
  };
  
  // Gérer l'édition d'un template
  const handleEditTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template && onEditTemplate) {
      onEditTemplate(template);
    }
    handleContextMenuClose();
  };
  
  // Gérer la sélection d'un template
  const handleSelectTemplate = (template: Template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };
  
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <DynamicTypography
            variant="h5"
            animationType="slide"
          >
            Templates de commandes
          </DynamicTypography>
          
          <AnimatedButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateTemplate}
            color="primary"
          >
            Nouveau template
          </AnimatedButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Rechercher un template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Tooltip title="Filtrer et trier">
            <IconButton onClick={handleFilterClick}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">Méthode de paiement</Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => { setPaymentFilter('all'); handleFilterClose(); }}
              selected={paymentFilter === 'all'}
            >
              <ListItemText>Toutes</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setPaymentFilter('cash'); handleFilterClose(); }}
              selected={paymentFilter === 'cash'}
            >
              <ListItemIcon>
                <CashIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Espèces</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setPaymentFilter('card'); handleFilterClose(); }}
              selected={paymentFilter === 'card'}
            >
              <ListItemIcon>
                <CardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Carte bancaire</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setPaymentFilter('both'); handleFilterClose(); }}
              selected={paymentFilter === 'both'}
            >
              <ListItemText>Les deux</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem disabled>
              <Typography variant="subtitle2">Tri</Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => { setSortOrder('date-desc'); handleFilterClose(); }}
              selected={sortOrder === 'date-desc'}
            >
              <ListItemIcon>
                <SortByAlpha fontSize="small" />
              </ListItemIcon>
              <ListItemText>Date (récent → ancien)</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setSortOrder('date-asc'); handleFilterClose(); }}
              selected={sortOrder === 'date-asc'}
            >
              <ListItemIcon>
                <SortByAlpha fontSize="small" sx={{ transform: 'scaleY(-1)' }} />
              </ListItemIcon>
              <ListItemText>Date (ancien → récent)</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setSortOrder('name-asc'); handleFilterClose(); }}
              selected={sortOrder === 'name-asc'}
            >
              <ListItemIcon>
                <SortByAlpha fontSize="small" />
              </ListItemIcon>
              <ListItemText>Nom (A → Z)</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setSortOrder('name-desc'); handleFilterClose(); }}
              selected={sortOrder === 'name-desc'}
            >
              <ListItemIcon>
                <SortByAlpha fontSize="small" sx={{ transform: 'scaleX(-1)' }} />
              </ListItemIcon>
              <ListItemText>Nom (Z → A)</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        
        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} key={item}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Typography color="error" align="center" sx={{ my: 4 }}>
            {error}
          </Typography>
        ) : filteredTemplates.length === 0 ? (
          <Typography align="center" sx={{ my: 4 }}>
            {searchTerm || paymentFilter !== 'all'
              ? 'Aucun template ne correspond à votre recherche.'
              : 'Aucun template disponible. Créez votre premier template !'}
          </Typography>
        ) : (
          <AnimatePresence>
            <Grid container spacing={2}>
              {filteredTemplates.map((template) => (
                <Grid item xs={12} key={template.id}>
                  <MicroInteraction
                    type="scale"
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <TemplateItem 
                      template={template}
                      onSelect={() => handleSelectTemplate(template)}
                      onEdit={() => onEditTemplate && onEditTemplate(template)}
                      onDelete={() => handleDeleteTemplate(template.id)}
                      onContextMenu={(e) => handleContextMenu(e, template.id)}
                    />
                  </MicroInteraction>
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>
        )}
        
        <Menu
          open={contextMenu !== null}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() => contextMenu && handleEditTemplate(contextMenu.templateId)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => contextMenu && handleDuplicateTemplate(contextMenu.templateId)}>
            <ListItemIcon>
              <DuplicateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dupliquer</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => contextMenu && handleDeleteTemplate(contextMenu.templateId)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: theme.palette.error.main }}>Supprimer</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default TemplateList;
