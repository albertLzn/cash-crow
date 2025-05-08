import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DailyReport, DailyReportGenerationParams, AlgorithmSettings } from '../models/DailyReport';
import * as generationService from '../services/generationService';

interface GenerationContextType {
  reports: DailyReport[];
  loading: boolean;
  generating: boolean;
  progress: number;
  error: string | null;
  selectedReport: DailyReport | null;
  defaultAlgorithmSettings: AlgorithmSettings;
  
  // Actions
  fetchReports: () => void;
  generateReport: (params: DailyReportGenerationParams) => Promise<DailyReport>;
  generateMultipleReports: (
    paramsList: DailyReportGenerationParams[], 
    onProgress?: generationService.GenerationProgressCallback
  ) => Promise<DailyReport[]>;  deleteReport: (id: string) => Promise<boolean>;
  selectReport: (report: DailyReport | null) => void;
  mergeReportsByDate: (reports: DailyReport[]) => DailyReport[];
  updateAlgorithmSettings: (settings: Partial<AlgorithmSettings>) => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const useGeneration = (): GenerationContextType => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};

interface GenerationProviderProps {
  children: ReactNode;
}

export const GenerationProvider: React.FC<GenerationProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [defaultAlgorithmSettings, setDefaultAlgorithmSettings] = useState<AlgorithmSettings>({
    variationFactor: 0.2,
    roundingPrecision: 2,
    preferExactMatch: true,
    allowNewOrderTypes: false,
    maxIterations: 1000,
    templateFidelity: 1,
  });

  // Charger les rapports au démarrage
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    try {
      setLoading(true);
      const fetchedReports = generationService.getAllReports();
      setReports(fetchedReports);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des rapports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (params: DailyReportGenerationParams): Promise<DailyReport> => {
    try {
      setGenerating(true);
      setProgress(0);
      setError(null);
      
      // Appliquer les paramètres d'algorithme par défaut si non spécifiés
      const paramsWithDefaults = {
        ...params,
        algorithmSettings: {
          ...defaultAlgorithmSettings,
          ...params.algorithmSettings
        }
      };
      
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);
      
      const report = await generationService.generateDailyReport(paramsWithDefaults);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setReports(prev => [...prev, report]);
      return report;
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
      console.error(err);
      throw err;
    } finally {
      // Petit délai pour montrer 100% avant de reset
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const generateMultipleReports = async (paramsList: DailyReportGenerationParams[]): Promise<DailyReport[]> => {
    try {
      setGenerating(true);
      setProgress(0);
      setError(null);
      
      // Appliquer les paramètres d'algorithme par défaut à chaque élément
      const paramsListWithDefaults = paramsList.map(params => ({
        ...params,
        algorithmSettings: {
          ...defaultAlgorithmSettings,
          ...params.algorithmSettings
        }
      }));
      
      const totalReports = paramsList.length;
      let completedReports = 0;
      
      const newReports: DailyReport[] = [];
      
      for (const params of paramsListWithDefaults) {
        try {
          const report = await generationService.generateDailyReport(params);
          newReports.push(report);
          completedReports++;
          setProgress((completedReports / totalReports) * 100);
        } catch (err) {
          console.error(`Erreur lors de la génération du rapport pour ${params.date}:`, err);
        }
      }
      
      setReports(prev => [...prev, ...newReports]);
      return newReports;
    } catch (err) {
      setError('Erreur lors de la génération des rapports');
      console.error(err);
      throw err;
    } finally {
      // Petit délai pour montrer 100% avant de reset
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    try {
      const success = generationService.deleteReport(id);
      
      if (success) {
        setReports(prev => prev.filter(report => report.id !== id));
        
        // Désélectionner le rapport si c'était celui qui était sélectionné
        if (selectedReport && selectedReport.id === id) {
          setSelectedReport(null);
        }
      }
      
      return success;
    } catch (err) {
      setError('Erreur lors de la suppression du rapport');
      console.error(err);
      throw err;
    }
  };

  const selectReport = (report: DailyReport | null) => {
    setSelectedReport(report);
  };

  const mergeReportsByDate = (reportsToMerge: DailyReport[]): DailyReport[] => {
    const mergedReports = generationService.mergeReportsByDate(reportsToMerge);
    return mergedReports;
  };

  const updateAlgorithmSettings = (settings: Partial<AlgorithmSettings>) => {
    setDefaultAlgorithmSettings(prev => ({
      ...prev,
      ...settings
    }));
  };

  const value = {
    reports,
    loading,
    generating,
    progress,
    error,
    selectedReport,
    defaultAlgorithmSettings,
    fetchReports,
    generateReport,
    generateMultipleReports,
    deleteReport,
    selectReport,
    mergeReportsByDate,
    updateAlgorithmSettings
  };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
};
