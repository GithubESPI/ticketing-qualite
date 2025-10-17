// Test de l'ancienne API PowerBI
const axios = require('axios');

// Configuration pour l'API PowerBI
const POWERBI_CONFIG = {
  url: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('🧪 Test de l\'API PowerBI...');
console.log('📧 Email:', POWERBI_CONFIG.email);
console.log('🔗 URL:', POWERBI_CONFIG.url);
console.log('🔑 Token:', POWERBI_CONFIG.token.substring(0, 20) + '...');

// Test de l'API PowerBI
async function testPowerBIAPI() {
  try {
    console.log('\n🔗 Test de connexion PowerBI...');
    
    const response = await axios.get(POWERBI_CONFIG.url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${POWERBI_CONFIG.email}:${POWERBI_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Connexion PowerBI réussie !');
    console.log('📊 Données reçues:', {
      status: response.status,
      dataType: typeof response.data,
      dataKeys: Object.keys(response.data || {}),
      hasValue: !!response.data.value,
      hasResults: !!response.data.d?.results
    });
    
    // Analyser la structure des données
    const ticketsData = response.data.value || response.data.d?.results || response.data;
    console.log('🎫 Tickets trouvés:', Array.isArray(ticketsData) ? ticketsData.length : 1);
    
    if (Array.isArray(ticketsData) && ticketsData.length > 0) {
      console.log('📋 Premier ticket:', {
        id: ticketsData[0].id || ticketsData[0].key,
        summary: ticketsData[0].summary || ticketsData[0].title,
        status: ticketsData[0].status || ticketsData[0].state
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur PowerBI API:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', error.response.data);
    }
    
    return false;
  }
}

// Test de l'API Jira officielle (pour comparaison)
async function testJiraAPI() {
  try {
    console.log('\n🔗 Test de l\'API Jira officielle...');
    
    const response = await axios.get('https://groupe-espi.atlassian.net/rest/api/3/myself', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`informatique@groupe-espi.fr:${POWERBI_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Jira fonctionne !');
    console.log('👤 Utilisateur:', response.data.displayName);
    return true;
  } catch (error) {
    console.error('❌ API Jira ne fonctionne pas:', error.response?.status, error.response?.statusText);
    return false;
  }
}

// Lancer les tests
async function runTests() {
  console.log('🚀 Test des deux APIs...\n');
  
  const powerbi = await testPowerBIAPI();
  const jira = await testJiraAPI();
  
  console.log('\n📊 Résultats:');
  console.log('PowerBI API:', powerbi ? '✅' : '❌');
  console.log('Jira API:', jira ? '✅' : '❌');
  
  if (powerbi && !jira) {
    console.log('\n💡 Recommandation: Utilisez l\'API PowerBI qui fonctionne');
    console.log('   L\'application peut être configurée pour utiliser cette API');
  } else if (jira && !powerbi) {
    console.log('\n💡 Recommandation: Utilisez l\'API Jira officielle');
    console.log('   Vous devrez générer un token API Jira valide');
  } else if (powerbi && jira) {
    console.log('\n🎉 Les deux APIs fonctionnent !');
  } else {
    console.log('\n⚠️ Aucune API ne fonctionne. Vérifiez vos credentials.');
  }
}

runTests().catch(console.error);
