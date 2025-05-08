import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Template } from '../models/Template';
import { DailyReport, DailyReportGenerationParams, AlgorithmSettings } from '../models/DailyReport';
import { Order, OrderGroup, PaymentMethod } from '../models/Order';
import { getTemplateById, mergeTemplates } from './templateService';
import { distributeAmount } from '../utils/distributionAlgorithm';

/**
 * Clé de stockage local pour les rapports générés
 */
const REPORTS_STORAGE_KEY = 'order-generator-reports';

/**
 * Événements de processus pour le loader
 */
export type ProcessEvent = {
  message: string;
  progress: number;
};

export type GenerationProgressCallback = (event: ProcessEvent) => void;

// Messages de processus pour l'animation du loader
const PROCESS_MESSAGES = [
  "Analyzing template patterns...",
  "Calculating order distribution...",
  "Applying statistical models...",
  "Generating temporal distribution...",
  "Optimizing payment methods...",
  "Validating financial coherence...",
  "Applying variance algorithms...",
  "Finalizing transaction details...",
  "Ensuring data consistency...",
  "Preparing final report...",
];

/**
 * Récupère tous les rapports depuis le localStorage
 */
export const getAllReports = (): DailyReport[] => {
  try {
    const reportsJson = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!reportsJson) return [];
    return JSON.parse(reportsJson);
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error);
    return [];
  }
};

/**
 * Sauvegarde un rapport dans le localStorage
 */
export const saveReport = (report: DailyReport): DailyReport => {
  const reports = getAllReports();
  reports.push(report);
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  return report;
};

/**
 * Supprime un rapport
 */
export const deleteReport = (id: string): boolean => {
  const reports = getAllReports();
  const filteredReports = reports.filter(report => report.id !== id);
  
  if (filteredReports.length === reports.length) {
    return false; // Aucun rapport n'a été supprimé
  }
  
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(filteredReports));
  return true;
};

/**
 * Simule un processus de génération avec des messages
 */
const simulateGenerationProcess = async (
  onProgress?: GenerationProgressCallback
): Promise<void> => {
  // Générer un délai aléatoire entre 2 et 5 secondes
  const totalDelay = Math.floor(Math.random() * 3000) + 2000;
  const steps = PROCESS_MESSAGES.length;
  const stepDelay = totalDelay / steps;
  
  // Envoyer des mises à jour de progression
  for (let i = 0; i < steps; i++) {
    await new Promise(resolve => setTimeout(resolve, stepDelay));
    const progress = Math.round(((i + 1) / steps) * 100);
    
    if (onProgress) {
      onProgress({
        message: PROCESS_MESSAGES[i],
        progress
      });
    }
  }
};

/**
 * Génère un rapport journalier basé sur les paramètres fournis
 */
export const generateDailyReport = async (
  params: DailyReportGenerationParams,
  onProgress?: GenerationProgressCallback
): Promise<DailyReport> => {
  // Démarrer l'animation du loader
  if (onProgress) {
    onProgress({
      message: "Initializing generation process...",
      progress: 0
    });
  }
  
  // Simuler le processus de génération avec l'animation
  await simulateGenerationProcess(onProgress);
  
  // Paramètres par défaut de l'algorithme
  const defaultSettings: AlgorithmSettings = {
    variationFactor: 0.2,
    roundingPrecision: 2,
    preferExactMatch: true,
    allowNewOrderTypes: false,
    maxIterations: 1000,
    templateFidelity: 1,
  };
  
  const algorithmSettings = {
    ...defaultSettings,
    ...params.algorithmSettings
  };
  
  // Récupérer les templates à utiliser comme référence
  let templateToUse: Template | null = null;
  
  if (params.templateIds && params.templateIds.length > 0) {
    if (params.templateIds.length === 1) {
      templateToUse = getTemplateById(params.templateIds[0]) || null;
    } else {
      templateToUse = mergeTemplates(params.templateIds);
    }
  }
  
  if (!templateToUse) {
    throw new Error("Aucun template valide n'a été trouvé pour la génération");
  }
  
  // Générer les commandes en utilisant l'algorithme de distribution
  const { orders, orderGroups } = await distributeAmount(
    params.targetAmount,
    templateToUse,
    params.paymentMethod,
    algorithmSettings
  );
  
  // Calculer les montants par méthode de paiement
  const cashAmount = orders
    .filter(order => order.paymentMethod === 'cash')
    .reduce((sum, order) => sum + order.amount, 0);
    
  const cardAmount = orders
    .filter(order => order.paymentMethod === 'card')
    .reduce((sum, order) => sum + order.amount, 0);
  
  // Créer le rapport journalier
  const dailyReport: DailyReport = {
    id: uuidv4(),
    date: params.date,
    totalAmount: orders.reduce((sum, order) => sum + order.amount, 0),
    targetAmount: params.targetAmount,
    cashAmount,
    cardAmount,
    orders,
    orderGroups,
    generatedAt: new Date().toISOString(),
    templateIds: params.templateIds || [],
  };
  
  // Finaliser le processus
  if (onProgress) {
    onProgress({
      message: "Report successfully generated!",
      progress: 100
    });
  }
  
  // Sauvegarder le rapport
  return saveReport(dailyReport);
};

/**
 * Génère plusieurs rapports journaliers
 */
export const generateMultipleDailyReports = async (
  paramsList: DailyReportGenerationParams[],
  onProgress?: GenerationProgressCallback
): Promise<DailyReport[]> => {
  const reports: DailyReport[] = [];
  const totalReports = paramsList.length;
  
  // Initialiser la progression
  if (onProgress) {
    onProgress({
      message: `Preparing to generate ${totalReports} reports...`,
      progress: 0
    });
  }
  
  // Simuler le processus de génération avec l'animation
  await simulateGenerationProcess(onProgress);
  
  for (let i = 0; i < paramsList.length; i++) {
    try {
      // Mettre à jour la progression pour chaque rapport
      if (onProgress) {
        onProgress({
          message: `Generating report ${i + 1} of ${totalReports}...`,
          progress: Math.round(((i + 1) / totalReports) * 100)
        });
      }
      
      const report = await generateDailyReport(
        paramsList[i], 
        // Ne pas propager les événements de progression pour éviter la confusion
        undefined
      );
      
      reports.push(report);
    } catch (error) {
      console.error(`Erreur lors de la génération du rapport pour ${paramsList[i].date}:`, error);
    }
  }
  
  // Finaliser le processus
  if (onProgress) {
    onProgress({
      message: `Successfully generated ${reports.length} reports!`,
      progress: 100
    });
  }
  
  return reports;
};

/**
 * Fusionne les rapports qui ont la même date mais des méthodes de paiement différentes
 */
export const mergeReportsByDate = (reports: DailyReport[]): DailyReport[] => {
  const reportsByDate = new Map<string, DailyReport[]>();
  
  // Regrouper les rapports par date
  reports.forEach(report => {
    const key = report.date;
    if (!reportsByDate.has(key)) {
      reportsByDate.set(key, []);
    }
    reportsByDate.get(key)!.push(report);
  });
  
  const mergedReports: DailyReport[] = [];
  
  // Fusionner les rapports ayant la même date
  reportsByDate.forEach((dateReports, date) => {
    if (dateReports.length === 1) {
      mergedReports.push(dateReports[0]);
    } else {
      // Fusionner les rapports
      const mergedReport: DailyReport = {
        id: uuidv4(),
        date,
        totalAmount: dateReports.reduce((sum, report) => sum + report.totalAmount, 0),
        targetAmount: dateReports.reduce((sum, report) => sum + report.targetAmount, 0),
        cashAmount: dateReports.reduce((sum, report) => sum + report.cashAmount, 0),
        cardAmount: dateReports.reduce((sum, report) => sum + report.cardAmount, 0),
        orders: dateReports.flatMap(report => report.orders),
        orderGroups: [],
        generatedAt: new Date().toISOString(),
        templateIds: Array.from(new Set(dateReports.flatMap(report => report.templateIds))),
      };
      
      // Recalculer les groupes de commandes
      const groupMap = new Map<string, OrderGroup>();
      
      mergedReport.orders.forEach(order => {
        const key = `${order.amount}-${order.paymentMethod}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, {
            amount: order.amount,
            count: 0,
            paymentMethod: order.paymentMethod,
            description: order.description
          });
        }
        groupMap.get(key)!.count++;
      });
      
      mergedReport.orderGroups = Array.from(groupMap.values());
      mergedReports.push(mergedReport);
    }
  });
  
  return mergedReports;
};
