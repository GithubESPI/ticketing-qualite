// Configurations d'API alternatives pour les tests

export interface ApiConfig {
  name: string;
  email: string;
  token: string;
  url: string;
  description: string;
}

export const API_CONFIGS: ApiConfig[] = [
  {
    name: 'Configuration actuelle',
    email: 'informatique@gmail.com',
    token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40=',
    url: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    description: 'Configuration par défaut avec les credentials fournis'
  },
  {
    name: 'Test avec email admin',
    email: 'admin@alphaservesp.com',
    token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40=',
    url: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    description: 'Test avec un email administrateur'
  },
  {
    name: 'Test avec email support',
    email: 'support@alphaservesp.com',
    token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40=',
    url: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    description: 'Test avec un email support'
  }
];

// Fonction pour tester une configuration spécifique
export const testApiConfig = async (config: ApiConfig) => {
  try {
    const response = await fetch(config.url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.token}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result: {
      config: ApiConfig;
      success: boolean;
      status: number;
      statusText: string;
      headers: Record<string, string>;
      data: any;
    } = {
      config,
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: null
    };

    if (response.ok) {
      try {
        result.data = await response.json();
      } catch (e) {
        result.data = await response.text();
      }
    } else {
      result.data = await response.text();
    }

    return result;
  } catch (error) {
    return {
      config,
      success: false,
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};
