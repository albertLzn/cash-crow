import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CreditCard as CardIcon,
  Money as CashIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DailyReport } from '../../models/DailyReport';
import DynamicTypography from '../common/DynamicTypography';
import AnimatedButton from '../common/AnimatedButton';

interface ResultDetailsProps {
  report: DailyReport;
  onExportPDF?: (report: DailyReport) => void;
}

const ResultDetails: React.FC<ResultDetailsProps> = ({
  report,
  onExportPDF
}) => {
  const theme = useTheme();

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? 'rgba(31, 41, 55, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        maxWidth: 700,
        margin: '0 auto'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <DynamicTypography variant="h5" animationType="3d">
          Détail du bilan du {formatDate(report.date)}
        </DynamicTypography>
        {onExportPDF && (
          <Tooltip title="Exporter en PDF">
            <AnimatedButton
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => onExportPDF(report)}
            >
              PDF
            </AnimatedButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<CashIcon fontSize="small" />}
          label={`Espèces: ${report.cashAmount.toFixed(2)} €`}
          color="success"
          variant="outlined"
        />
        <Chip
          icon={<CardIcon fontSize="small" />}
          label={`CB: ${report.cardAmount.toFixed(2)} €`}
          color="info"
          variant="outlined"
        />
        <Chip
          label={`Total: ${report.totalAmount.toFixed(2)} €`}
          color="primary"
          variant="filled"
        />
        <Chip
          label={`${report.orders.length} commande${report.orders.length > 1 ? 's' : ''}`}
          variant="outlined"
        />
      </Box>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Répartition des commandes :
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Montant</TableCell>
              <TableCell>Nb</TableCell>
              <TableCell>Méthode</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.orderGroups.map((group, idx) => (
              <TableRow key={idx}>
                <TableCell>{group.amount.toFixed(2)} €</TableCell>
                <TableCell>{group.count}</TableCell>
                <TableCell>
                  {group.paymentMethod === 'cash' ? <CashIcon fontSize="small" /> : <CardIcon fontSize="small" />}
                </TableCell>
                <TableCell>{group.description || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Détail chronologique :
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Heure</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Méthode</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.orders.map((order, idx) => (
              <TableRow key={order.id}>
                <TableCell>
                  {format(new Date(order.timestamp), 'HH:mm')}
                </TableCell>
                <TableCell>{order.amount.toFixed(2)} €</TableCell>
                <TableCell>
                  {order.paymentMethod === 'cash' ? <CashIcon fontSize="small" /> : <CardIcon fontSize="small" />}
                </TableCell>
                <TableCell>{order.description || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ResultDetails;
