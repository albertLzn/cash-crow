import React, { useState } from 'react';
import { CssBaseline, Box, Dialog, DialogContent } from '@mui/material';
import { TemplateProvider } from './context/TemplateContext';
import { GenerationProvider } from './context/GenerationContext';
import { AppThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import TemplateList from './components/templates/TemplateList';
import TemplateForm from './components/templates/TemplateForm';
import GenerationForm from './components/generation/GenerationForm';
import ResultsList from './components/results/ResultsList';
import ResultDetails from './components/results/ResultDetails';
import PDFExport from './components/results/PDFExport';
import { Template } from './models/Template';
import { DailyReport } from './models/DailyReport';

const App: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingReport, setViewingReport] = useState<DailyReport | null>(null);
  const [exportReports, setExportReports] = useState<DailyReport[]>([]);

  return (
    <AppThemeProvider>
      <TemplateProvider>
        <GenerationProvider>
          <CssBaseline />
          <MainLayout>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Template management */}
              {!editingTemplate && (
                <TemplateList
                  onCreateTemplate={() => setEditingTemplate({} as Template)}
                  onEditTemplate={(template) => setEditingTemplate(template)}
                  onSelectTemplate={(template) => setSelectedTemplate(template)}
                />
              )}

              {/* Template form for create/edit */}
              {editingTemplate && (
                <TemplateForm
                  initialTemplate={editingTemplate.id ? editingTemplate : undefined}
                  onSave={() => setEditingTemplate(null)}
                  onCancel={() => setEditingTemplate(null)}
                />
              )}

              {/* Generation form */}
              {!editingTemplate && (
                <GenerationForm
                  onGenerationComplete={() => {
                    // Reset or update UI after generation
                  }}
                />
              )}

              {/* Results list */}
              {!editingTemplate && (
                <ResultsList
                  onViewReport={(report) => setViewingReport(report)}
                  onExportPDF={(reports) => setExportReports(reports)}
                />
              )}

              {/* PDF Export button if reports selected */}
              {exportReports.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
                  <PDFExport
                    reports={exportReports}
                    filename="bilans_export.pdf"
                  />
                </Box>
              )}
            </Box>

            {/* Result details dialog */}
            <Dialog 
              open={viewingReport !== null} 
              onClose={() => setViewingReport(null)}
              maxWidth="md"
              fullWidth
            >
              <DialogContent sx={{ p: 0 }}>
                {viewingReport && (
                  <ResultDetails
                    report={viewingReport}
                    onExportPDF={(report) => {
                      setExportReports([report]);
                      setViewingReport(null);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </MainLayout>
        </GenerationProvider>
      </TemplateProvider>
    </AppThemeProvider>
  );
};

export default App;
