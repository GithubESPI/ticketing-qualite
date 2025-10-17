const axios = require('axios');

// Import de la configuration (simulation de l'import TypeScript)
const config = {
  jira: {
    baseUrl: process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://groupe-espi.atlassian.net',
    email: process.env.NEXT_PUBLIC_JIRA_EMAIL || 'informatique@groupe-espi.fr',
    apiToken: process.env.NEXT_PUBLIC_JIRA_API_TOKEN || 'VOTRE_API_KEY_ICI',
    projectKey: process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY || 'DYS',
    
    // Configuration PowerBI (fallback)
    powerbiUrl: process.env.NEXT_PUBLIC_JIRA_URL || 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    token: process.env.NEXT_PUBLIC_JIRA_TOKEN || '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
  }
};

console.log('🔧 Configuration utilisée:');
console.log(`- Base URL: ${config.jira.baseUrl}`);
console.log(`- Email: ${config.jira.email}`);
console.log(`- API Token: ${config.jira.apiToken.substring(0, 10)}...`);
console.log(`- Project Key: ${config.jira.projectKey}`);
console.log(`- PowerBI URL: ${config.jira.powerbiUrl ? 'Configuré' : 'Non configuré'}`);
console.log(`- PowerBI Token: ${config.jira.token ? 'Configuré' : 'Non configuré'}\n`);

// Test de l'API PowerBI comme fallback
async function testPowerBIFallback() {
  console.log('🔍 Test de l\'API PowerBI comme fallback...\n');
  
  try {
    // Test de l'API PowerBI
    console.log('📋 1. Test de l\'API PowerBI:');
    const powerbiAuth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
    
    const powerbiResponse = await axios.get(config.jira.powerbiUrl, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ API PowerBI accessible !`);
    console.log(`Type de données: ${typeof powerbiResponse.data}`);
    console.log(`Clés disponibles: ${Object.keys(powerbiResponse.data).join(', ')}`);
    
    // Analyser la structure des données
    if (Array.isArray(powerbiResponse.data)) {
      console.log(`\n📊 Données PowerBI (${powerbiResponse.data.length} éléments):`);
      if (powerbiResponse.data.length > 0) {
        console.log('Premier élément:');
        console.log(JSON.stringify(powerbiResponse.data[0], null, 2));
        
        console.log('\nChamps disponibles dans le premier élément:');
        Object.keys(powerbiResponse.data[0]).forEach((key, index) => {
          console.log(`${index + 1}. ${key}: ${typeof powerbiResponse.data[0][key]}`);
        });
      }
    } else if (powerbiResponse.data.value) {
      console.log(`\n📊 Données PowerBI (${powerbiResponse.data.value.length} éléments):`);
      if (powerbiResponse.data.value.length > 0) {
        console.log('Premier élément:');
        console.log(JSON.stringify(powerbiResponse.data.value[0], null, 2));
        
        console.log('\nChamps disponibles dans le premier élément:');
        Object.keys(powerbiResponse.data.value[0]).forEach((key, index) => {
          console.log(`${index + 1}. ${key}: ${typeof powerbiResponse.data.value[0][key]}`);
        });
      }
    } else {
      console.log('\n📊 Structure des données PowerBI:');
      console.log(JSON.stringify(powerbiResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API PowerBI:', error.response ? error.response.data : error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Erreur d\'authentification PowerBI - Vérifiez votre token PowerBI');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Erreur de permissions PowerBI - Votre utilisateur n\'a peut-être pas les droits');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Endpoint PowerBI non trouvé - Vérifiez l\'URL PowerBI');
    }
  }
}

// Test de l'API Jira si le token est configuré
async function testJiraAPI() {
  if (config.jira.apiToken === 'VOTRE_API_KEY_ICI') {
    console.log('\n⚠️ API Token Jira non configuré, test de l\'API PowerBI uniquement\n');
    return;
  }

  console.log('\n🔍 Test de l\'API Jira...\n');
  
  try {
    const auth = Buffer.from(`${config.jira.email}:${config.jira.apiToken}`).toString('base64');
    
    const axiosInstance = axios.create({
      baseURL: config.jira.baseUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Test de l'endpoint de base
    console.log('📋 Test de l\'endpoint /rest/api/3/field/search:');
    const allFieldsResponse = await axiosInstance.get('/rest/api/3/field/search');
    console.log(`✅ Succès ! Total: ${allFieldsResponse.data.length} champs trouvés`);
    
    const customFields = allFieldsResponse.data.filter(field => field.custom === true);
    console.log(`🔧 Champs personnalisés: ${customFields.length}`);

  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API Jira:', error.response ? error.response.data : error.message);
  }
}

// Exécution des tests
async function runTests() {
  await testPowerBIFallback();
  await testJiraAPI();
  
  console.log('\n📊 Résumé des tests:');
  console.log(`- Configuration Jira: ${config.jira.baseUrl}`);
  console.log(`- Configuration PowerBI: ${config.jira.powerbiUrl ? 'Configuré' : 'Non configuré'}`);
  console.log(`- API Token Jira: ${config.jira.apiToken === 'VOTRE_API_KEY_ICI' ? 'Non configuré' : 'Configuré'}`);
  console.log(`- PowerBI Token: ${config.jira.token ? 'Configuré' : 'Non configuré'}`);
}

runTests();
