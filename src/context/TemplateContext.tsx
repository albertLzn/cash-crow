import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Template, TemplateStats } from '../models/Template';
import * as templateService from '../services/templateService';

interface TemplateContextType {
  templates: Template[];
  loading: boolean;
  error: string | null;
  selectedTemplate: Template | null;
  templateStats: TemplateStats | null;
  
  // Actions
  fetchTemplates: () => void;
  getTemplateById: (id: string) => Template | undefined;
  saveTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Template>;
  updateTemplate: (id: string, templateData: Partial<Template>) => Promise<Template | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  selectTemplate: (template: Template | null) => void;
  analyzeTemplate: (template: Template) => TemplateStats;
  mergeTemplates: (templateIds: string[]) => Template | null;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplates = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};

interface TemplateProviderProps {
  children: ReactNode;
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateStats, setTemplateStats] = useState<TemplateStats | null>(null);

  // Charger les templates au démarrage
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Mettre à jour les stats quand un template est sélectionné
  useEffect(() => {
    if (selectedTemplate) {
      const stats = templateService.analyzeTemplate(selectedTemplate);
      setTemplateStats(stats);
    } else {
      setTemplateStats(null);
    }
  }, [selectedTemplate]);

  const fetchTemplates = () => {
    try {
      setLoading(true);
      const fetchedTemplates = templateService.getAllTemplates();
      setTemplates(fetchedTemplates);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateById = (id: string) => {
    return templateService.getTemplateById(id);
  };

  const saveTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> => {
    try {
      const newTemplate = templateService.saveTemplate(template);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError('Erreur lors de la sauvegarde du template');
      console.error(err);
      throw err;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<Template>): Promise<Template | null> => {
    try {
      const updatedTemplate = templateService.updateTemplate(id, templateData);
      
      if (updatedTemplate) {
        setTemplates(prev => 
          prev.map(template => template.id === id ? updatedTemplate : template)
        );
        
        // Mettre à jour le template sélectionné si nécessaire
        if (selectedTemplate && selectedTemplate.id === id) {
          setSelectedTemplate(updatedTemplate);
        }
      }
      
      return updatedTemplate;
    } catch (err) {
      setError('Erreur lors de la mise à jour du template');
      console.error(err);
      throw err;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const success = templateService.deleteTemplate(id);
      
      if (success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        
        // Désélectionner le template si c'était celui qui était sélectionné
        if (selectedTemplate && selectedTemplate.id === id) {
          setSelectedTemplate(null);
        }
      }
      
      return success;
    } catch (err) {
      setError('Erreur lors de la suppression du template');
      console.error(err);
      throw err;
    }
  };

  const selectTemplate = (template: Template | null) => {
    setSelectedTemplate(template);
  };

  const analyzeTemplate = (template: Template): TemplateStats => {
    return templateService.analyzeTemplate(template);
  };

  const mergeTemplates = (templateIds: string[]): Template | null => {
    return templateService.mergeTemplates(templateIds);
  };

  const value = {
    templates,
    loading,
    error,
    selectedTemplate,
    templateStats,
    fetchTemplates,
    getTemplateById,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    analyzeTemplate,
    mergeTemplates
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};
