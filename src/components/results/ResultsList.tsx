import React, { useState } from 'react';
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
  Button,
  styled
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  CreditCard as CardIcon,
  Money as CashIcon,
  FilterList as FilterIcon,
  SortByAlpha as SortIcon,
  CalendarToday as CalendarIcon,
  FileDownload as DownloadIcon,
  Visibility as ViewIcon,
  MergeType as MergeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DailyReport } from '../../models/DailyReport';
import { useGeneration } from '../../context/GenerationContext';
import DynamicTypography from '../common/DynamicTypography';
import AnimatedButton from '../common/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';
import MicroInteraction from '../common/MicroInteraction';
import ResultDetails from './ResultDetails';
export const Grid = styled(MuiGrid)<any>({});

interface ResultsListProps {
  onViewReport?: (report: DailyReport) => void;
  onExportPDF?: (reports: DailyReport[]) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({
  onViewReport,
  onExportPDF
}) => {
  const theme = useTheme();
  const { reports, loading, error, deleteReport, mergeReportsByDate } = useGeneration();
  
  // État local pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'both'>('all');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  
  // État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    reportId: string;
  } | null>(null);
  
  // Filtrer et trier les rapports
  const filteredReports = reports
    .filter(report => {
      // Filtrer par terme de recherche (date)
      const matchesSearch = report.date.includes(searchTerm);
      
      // Filtrer par méthode de paiement
      const matchesPayment = paymentFilter === 'all' || 
        (paymentFilter === 'cash' && report.cashAmount > 0) ||
        (paymentFilter === 'card' && report.cardAmount > 0) ||
        (paymentFilter === 'both' && report.cashAmount > 0 && report.cardAmount > 0);
      
      return matchesSearch && matchesPayment;
    })
    .sort((a, b) => {
      // Trier par date ou montant
      switch (sortOrder) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.totalAmount - a.totalAmount;
        case 'amount-asc':
          return a.totalAmount - b.totalAmount;
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
  const handleContextMenu = (event: React.MouseEvent, reportId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      reportId
    });
  };
  
  // Gérer la fermeture du menu contextuel
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };
  
  // Gérer la suppression d'un rapport
  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await deleteReport(id);
        setSelectedReports(prev => prev.filter(reportId => reportId !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression du rapport:', err);
      }
    }
    handleContextMenuClose();
  };
  
  // Gérer la sélection d'un rapport
  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };
  
  // Gérer la sélection de tous les rapports
  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };
  
  // Gérer la fusion des rapports sélectionnés
  const handleMergeReports = () => {
    if (selectedReports.length < 2) {
      alert('Sélectionnez au moins deux rapports à fusionner.');
      return;
    }
    
    const reportsToMerge = reports.filter(report => selectedReports.includes(report.id));
    const mergedReports = mergeReportsByDate(reportsToMerge);
    
    // Réinitialiser la sélection
    setSelectedReports([]);
  };
  
  // Gérer l'exportation des rapports sélectionnés
  const handleExportSelected = () => {
    if (selectedReports.length === 0) {
      alert('Sélectionnez au moins un rapport à exporter.');
      return;
    }
    
    const reportsToExport = reports.filter(report => selectedReports.includes(report.id));
    
    if (onExportPDF) {
      onExportPDF(reportsToExport);
    }
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
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
            Bilans générés
          </DynamicTypography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <AnimatedButton
              variant="outlined"
              startIcon={<MergeIcon />}
              onClick={handleMergeReports}
              disabled={selectedReports.length < 2}
              size="small"
            >
              Fusionner
            </AnimatedButton>
            
            <AnimatedButton
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportSelected}
              disabled={selectedReports.length === 0}
              color="primary"
              size="small"
            >
              Exporter PDF
            </AnimatedButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Rechercher par date..."
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
                <CalendarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Date (récent → ancien)</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setSortOrder('date-asc'); handleFilterClose(); }}
              selected={sortOrder === 'date-asc'}
            >
              <ListItemIcon>
                <CalendarIcon fontSize="small" sx={{ transform: 'scaleY(-1)' }} />
              </ListItemIcon>
              <ListItemText>Date (ancien → récent)</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setSortOrder('amount-desc'); handleFilterClose(); }}
              selected={sortOrder === 'amount-desc'}
            >
              <ListItemIcon>
                <SortIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Montant (décroissant)</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => { setSortOrder('amount-asc'); handleFilterClose(); }}
              selected={sortOrder === 'amount-asc'}
            >
              <ListItemIcon>
                <SortIcon fontSize="small" sx={{ transform: 'scaleY(-1)' }} />
              </ListItemIcon>
              <ListItemText>Montant (croissant)</ListItemText>
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
        ) : filteredReports.length === 0 ? (
          <Typography align="center" sx={{ my: 4 }}>
            {searchTerm || paymentFilter !== 'all'
              ? 'Aucun bilan ne correspond à votre recherche.'
              : 'Aucun bilan disponible. Générez votre premier bilan !'}
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                size="small"
                onClick={handleSelectAll}
              >
                {selectedReports.length === filteredReports.length
                  ? 'Désélectionner tout'
                  : 'Sélectionner tout'}
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                {filteredReports.length} bilan{filteredReports.length > 1 ? 's' : ''} trouvé{filteredReports.length > 1 ? 's' : ''}
              </Typography>
            </Box>
            
            <AnimatePresence>
              <Grid container spacing={2}>
                {filteredReports.map((report) => (
                  <Grid item xs={12} key={report.id}>
                    <MicroInteraction
                      type="scale"
                      component={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          cursor: 'pointer',
                          borderLeft: selectedReports.includes(report.id)
                            ? `4px solid ${theme.palette.primary.main}`
                            : `4px solid transparent`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => handleSelectReport(report.id)}
                        onContextMenu={(e) => handleContextMenu(e, report.id)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6" component="div" gutterBottom>
                                {formatDate(report.date)}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                {report.cashAmount > 0 && (
                                  <Chip
                                    icon={<CashIcon fontSize="small" />}
                                    label={`Espèces: ${report.cashAmount.toFixed(2)} €`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                                
                                {report.cardAmount > 0 && (
                                  <Chip
                                    icon={<CardIcon fontSize="small" />}
                                    label={`CB: ${report.cardAmount.toFixed(2)} €`}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Voir les détails">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onViewReport && onViewReport(report); 
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Supprimer">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleDeleteReport(report.id); 
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {report.orders.length} commande{report.orders.length > 1 ? 's' : ''}
                            </Typography>
                            
                            <Typography variant="h6" color="primary">
                              {report.totalAmount.toFixed(2)} €
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </MicroInteraction>
                  </Grid>
                ))}
              </Grid>
            </AnimatePresence>
          </>
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
          <MenuItem onClick={() => {
            if (contextMenu) {
              const report = reports.find(r => r.id === contextMenu.reportId);
              if (report && onViewReport) {
                onViewReport(report);
              }
            }
            handleContextMenuClose();
          }}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Voir les détails</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (contextMenu) {
              const report = reports.find(r => r.id === contextMenu.reportId);
              if (report && onExportPDF) {
                onExportPDF([report]);
              }
            }
            handleContextMenuClose();
          }}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Exporter en PDF</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => contextMenu && handleDeleteReport(contextMenu.reportId)}>
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

export default ResultsList;
