import { Template, TemplateStats } from '../models/Template';
import { v4 as uuidv4 } from 'uuid';

// Clé de stockage local pour les templates
const TEMPLATES_STORAGE_KEY = 'order-generator-templates';

/**
 * Récupère tous les templates depuis le localStorage
 */
export const getAllTemplates = (): Template[] => {
  try {
    const templatesJson = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!templatesJson) return [];
    return JSON.parse(templatesJson);
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return [];
  }
};

/**
 * Récupère un template par son ID
 */
export const getTemplateById = (id: string): Template | undefined => {
  const templates = getAllTemplates();
  return templates.find(template => template.id === id);
};

/**
 * Sauvegarde un nouveau template
 */
export const saveTemplate = (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template => {
  const templates = getAllTemplates();
  
  const newTemplate: Template = {
    ...template,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  
  return newTemplate;
};

/**
 * Met à jour un template existant
 */
export const updateTemplate = (id: string, templateData: Partial<Template>): Template | null => {
  const templates = getAllTemplates();
  const templateIndex = templates.findIndex(t => t.id === id);
  
  if (templateIndex === -1) return null;
  
  const updatedTemplate: Template = {
    ...templates[templateIndex],
    ...templateData,
    updatedAt: new Date().toISOString(),
  };
  
  templates[templateIndex] = updatedTemplate;
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  
  return updatedTemplate;
};

/**
 * Supprime un template
 */
export const deleteTemplate = (id: string): boolean => {
  const templates = getAllTemplates();
  const filteredTemplates = templates.filter(template => template.id !== id);
  
  if (filteredTemplates.length === templates.length) {
    return false; // Aucun template n'a été supprimé
  }
  
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filteredTemplates));
  return true;
};

/**
 * Calcule des statistiques sur un template
 */
export const analyzeTemplate = (template: Template): TemplateStats => {
  const totalOrders = template.orders.reduce((sum, order) => sum + order.frequency, 0);
  
  // Calcul de la valeur moyenne des commandes
  const totalValue = template.orders.reduce((sum, order) => sum + (order.amount * order.frequency), 0);
  const averageOrderValue = totalValue / totalOrders;
  
  // Distribution du nombre de commandes
  const orderCountDistribution: Record<number, number> = {};
  template.orders.forEach(order => {
    orderCountDistribution[order.frequency] = (orderCountDistribution[order.frequency] || 0) + 1;
  });
  
  // Fréquence par montant
  const frequencyByAmount: Record<number, number> = {};
  template.orders.forEach(order => {
    frequencyByAmount[order.amount] = (frequencyByAmount[order.amount] || 0) + order.frequency;
  });
  
  return {
    averageOrderValue,
    orderCountDistribution,
    frequencyByAmount,
    totalOrders,
  };
};

/**
 * Fusionne plusieurs templates pour l'analyse
 */
export const mergeTemplates = (templateIds: string[]): Template | null => {
  const templates = getAllTemplates().filter(t => templateIds.includes(t.id));
  
  if (templates.length === 0) return null;
  
  // Créer un template fusionné
  const mergedTemplate: Template = {
    id: 'merged',
    name: 'Templates fusionnés',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'both',
    totalAmount: templates.reduce((sum, t) => sum + t.totalAmount, 0),
    orders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Fusionner les commandes
  const orderMap = new Map();
  
  templates.forEach(template => {
    template.orders.forEach(order => {
      const key = `${order.amount}`;
      if (orderMap.has(key)) {
        const existingOrder = orderMap.get(key);
        existingOrder.frequency += order.frequency;
      } else {
        orderMap.set(key, { ...order, id: uuidv4() });
      }
    });
  });
  
  mergedTemplate.orders = Array.from(orderMap.values());
  
  return mergedTemplate;
};
