import React from 'react';
import { DailyReport } from '../../models/DailyReport';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AnimatedButton from '../common/AnimatedButton';

interface PDFExportProps {
  reports: DailyReport[];
  filename?: string;
}

const PDFExport: React.FC<PDFExportProps> = ({ reports, filename = 'bilans.pdf' }) => {
  const handleExport = () => {
    const doc = new jsPDF();
    reports.forEach((report, idx) => {
      if (idx !== 0) doc.addPage();

      doc.setFontSize(16);
      doc.text(`Bilan du ${format(new Date(report.date), 'dd MMMM yyyy', { locale: fr })}`, 14, 18);

      doc.setFontSize(12);
      doc.text(`Espèces: ${report.cashAmount.toFixed(2)} €`, 14, 28);
      doc.text(`CB: ${report.cardAmount.toFixed(2)} €`, 60, 28);
      doc.text(`Total: ${report.totalAmount.toFixed(2)} €`, 120, 28);

      autoTable(doc, {
        startY: 35,
        head: [['Montant', 'Nb', 'Méthode', 'Description']],
        body: report.orderGroups.map(group => [
          `${group.amount.toFixed(2)} €`,
          group.count,
          group.paymentMethod === 'cash' ? 'Espèces' : 'CB',
          group.description || '-'
        ]),
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY! + 8,
        head: [['Heure', 'Montant', 'Méthode', 'Description']],
        body: report.orders.map(order => [
          format(new Date(order.timestamp), 'HH:mm'),
          `${order.amount.toFixed(2)} €`,
          order.paymentMethod === 'cash' ? 'Espèces' : 'CB',
          order.description || '-'
        ]),
        theme: 'striped',
        styles: { fontSize: 9 }
      });
    });

    doc.save(filename);
  };

  return (
    <AnimatedButton
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      sx={{ mt: 2 }}
    >
      Exporter PDF
    </AnimatedButton>
  );
};

export default PDFExport;
