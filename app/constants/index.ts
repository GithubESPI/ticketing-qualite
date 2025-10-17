// Constantes de l'application

export const APP_CONFIG = {
  name: 'Tableau de bord Jira',
  version: '1.0.0',
  description: 'Système de gestion des tickets Jira'
};

export const API_CONFIG = {
  timeout: 10000, // 10 secondes
  retryAttempts: 3,
  retryDelay: 1000 // 1 seconde
};

export const UI_CONFIG = {
  animationDuration: 300,
  debounceDelay: 500,
  itemsPerPage: 10
};

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4'
};

export const PRIORITY_COLORS = {
  haute: 'bg-red-100 text-red-800 border-red-200',
  moyenne: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  basse: 'bg-green-100 text-green-800 border-green-200',
  normal: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const STATUS_COLORS = {
  'terminé': 'text-green-600 bg-green-50',
  'en cours': 'text-blue-600 bg-blue-50',
  'nouveau': 'text-purple-600 bg-purple-50',
  'en attente': 'text-orange-600 bg-orange-50'
};
