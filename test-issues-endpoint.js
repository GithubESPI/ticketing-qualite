// Test de l'endpoint Issues spécifique
const axios = require('axios');

const POWERBI_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

async function testIssuesEndpoint() {
  try {
    console.log('🔍 Test des endpoints Jira...\n');
    
    // Test 1: Endpoint de base
    console.log('🔗 Test 1: Endpoint de base');
    const baseUrl = `${POWERBI_CONFIG.baseUrl}/rest/api/3/myself`;
    console.log('URL:', baseUrl);
    
    const response = await axios.get(issuesUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${POWERBI_CONFIG.email}:${POWERBI_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Endpoint Issues accessible !');
    console.log('📊 Structure:', {
      status: response.status,
      dataType: typeof response.data,
      dataKeys: Object.keys(response.data || {}),
      hasValue: !!response.data.value,
      hasResults: !!response.data.d?.results
    });
    
    // Analyser les données
    const issues = response.data.value || response.data.d?.results || response.data;
    console.log('\n🎫 Issues trouvés:', Array.isArray(issues) ? issues.length : 1);
    
    if (Array.isArray(issues) && issues.length > 0) {
      console.log('\n📋 Premier issue:');
      const firstIssue = issues[0];
      console.log('Keys:', Object.keys(firstIssue));
      console.log('Valeurs:', JSON.stringify(firstIssue, null, 2));
      
      // Mapping pour notre application
      const mappedIssue = {
        id: firstIssue.id || firstIssue.key || firstIssue.ticket_id || `TICKET-${Date.now()}`,
        summary: firstIssue.summary || firstIssue.title || firstIssue.subject || firstIssue.description || 'Sans titre',
        status: firstIssue.status || firstIssue.state || firstIssue.workflow_state || 'Nouveau',
        priority: firstIssue.priority || firstIssue.severity || 'Normal',
        assignee: firstIssue.assignee || firstIssue.assigned_to || firstIssue.owner || firstIssue.user_name || 'Non assigné',
        created: firstIssue.created || firstIssue.created_date || firstIssue.date_created || firstIssue.created_at || new Date().toISOString().split('T')[0],
        description: firstIssue.description || firstIssue.details || firstIssue.content || firstIssue.body || undefined
      };
      
      console.log('\n🔄 Issue mappé:');
      console.log(JSON.stringify(mappedIssue, null, 2));
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur endpoint Issues:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

// Test avec différents endpoints possibles
async function testAllEndpoints() {
  const endpoints = [
    '/Issues',
    '/issues',
    '/Issues?$top=10',
    '/Issues?$select=*',
    '/Issues?$format=json'
  ];
  
  console.log('🧪 Test de tous les endpoints possibles...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔗 Test: ${endpoint}`);
      const url = `${POWERBI_CONFIG.baseUrl}${endpoint}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${POWERBI_CONFIG.email}:${POWERBI_CONFIG.token}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      console.log('Data keys:', Object.keys(response.data || {}));
      
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.response?.status || error.message}`);
    }
  }
}

// Lancer les tests
async function runTests() {
  const issues = await testIssuesEndpoint();
  
  if (!issues) {
    console.log('\n🔄 Test des autres endpoints...');
    await testAllEndpoints();
  }
}

runTests().catch(console.error);
