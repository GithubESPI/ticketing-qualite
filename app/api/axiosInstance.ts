import axios from 'axios';

// Configuration de l'instance Axios pour Jira
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://votreentreprise.atlassian.net',
  timeout: 10000, // 10 secondes
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour l'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const email = process.env.NEXT_PUBLIC_JIRA_EMAIL;
    const token = process.env.NEXT_PUBLIC_JIRA_API_TOKEN;
    
    if (email && token) {
      // Authentification Basic pour Jira
      const credentials = Buffer.from(`${email}:${token}`).toString('base64');
      config.headers.Authorization = `Basic ${credentials}`;
    }
    
    console.log('🔗 Requête API Jira:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      email: email,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur de configuration de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse API Jira:', {
      status: response.status,
      statusText: response.statusText,
      dataKeys: Object.keys(response.data || {}),
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ Erreur API Jira:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
