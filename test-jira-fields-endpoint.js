const axios = require('axios');

// Configuration avec votre token
const config = {
  jira: {
    baseUrl: 'https://groupe-espi.atlassian.net',
    email: 'informatique@groupe-espi.fr',
    apiToken: 'VOTRE_API_KEY_ICI', // Remplacez par votre vraie API token
    projectKey: 'DYS',
    
    // Configuration PowerBI avec votre token
    powerbiUrl: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
  }
};

console.log('🔍 Test de l\'endpoint Jira avec tous les champs personnalisés...\n');

async function testJiraFieldsEndpoint() {
  try {
    if (config.jira.apiToken === 'VOTRE_API_KEY_ICI') {
      console.log('⚠️ API Token Jira non configuré, test de l\'API PowerBI uniquement\n');
      await testPowerBIEndpoint();
      return;
    }

    const auth = Buffer.from(`${config.jira.email}:${config.jira.apiToken}`).toString('base64');
    
    const axiosInstance = axios.create({
      baseURL: config.jira.baseUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // 1. Récupérer tous les champs disponibles
    console.log('📋 1. Récupération de tous les champs Jira:');
    const fieldsResponse = await axiosInstance.get('/rest/api/3/field/search');
    const allFields = fieldsResponse.data;
    const customFields = allFields.filter(field => field.custom === true);
    
    console.log(`✅ ${allFields.length} champs totaux trouvés`);
    console.log(`🔧 ${customFields.length} champs personnalisés identifiés`);
    
    // Afficher les premiers champs personnalisés
    console.log('\n📊 Premiers champs personnalisés:');
    customFields.slice(0, 10).forEach((field, index) => {
      console.log(`${index + 1}. ${field.id} - ${field.name} (${field.schema?.type || 'N/A'})`);
    });

    // 2. Construire la liste des champs à récupérer
    const fieldsToFetch = [
      'summary',
      'status',
      'priority',
      'assignee',
      'reporter',
      'created',
      'updated',
      'description',
      'issuetype',
      'project',
      // Ajouter tous les champs personnalisés
      ...customFields.map(field => field.id)
    ];

    console.log(`\n🔧 Champs à récupérer: ${fieldsToFetch.length}`);
    console.log(`📋 Champs standard: ${fieldsToFetch.length - customFields.length}`);
    console.log(`📋 Champs personnalisés: ${customFields.length}`);

    // 3. Récupérer les issues avec tous les champs
    console.log('\n📋 2. Récupération des issues avec tous les champs:');
    const issuesResponse = await axiosInstance.get('/rest/api/3/search', {
      params: {
        jql: `project = "${config.jira.projectKey}" ORDER BY created DESC`,
        maxResults: 5, // Limiter pour le test
        fields: fieldsToFetch.join(','),
        expand: 'changelog'
      }
    });

    const issues = issuesResponse.data.issues || [];
    console.log(`✅ ${issues.length} issues récupérés`);

    if (issues.length > 0) {
      const issue = issues[0];
      console.log(`\n📊 Premier issue: ${issue.key} - ${issue.fields.summary}`);
      
      // Analyser les champs personnalisés utilisés
      const usedCustomFields = [];
      Object.keys(issue.fields).forEach(fieldKey => {
        if (fieldKey.startsWith('customfield_') && issue.fields[fieldKey] !== null && issue.fields[fieldKey] !== undefined) {
          usedCustomFields.push({
            field: fieldKey,
            value: issue.fields[fieldKey],
            type: typeof issue.fields[fieldKey]
          });
        }
      });

      console.log(`\n🔍 Champs personnalisés utilisés dans ${issue.key}:`);
      if (usedCustomFields.length > 0) {
        usedCustomFields.forEach((field, index) => {
          console.log(`${index + 1}. ${field.field}: ${JSON.stringify(field.value)} (${field.type})`);
        });
      } else {
        console.log('Aucun champ personnalisé trouvé dans cet issue');
      }

      // 4. Comparer avec les champs PowerBI
      console.log('\n📊 3. Comparaison avec les champs PowerBI:');
      const powerbiFields = [
        'customfield_10001', // Action clôturée
        'customfield_10002', // Action corrective
        'customfield_10003', // Action curative
        'customfield_10004', // Date de constatation
        'customfield_10005', // Date effective de réalisation
        'customfield_10006', // Efficacité de l'action
        'customfield_10007'  // Entité Origine
      ];

      powerbiFields.forEach(field => {
        const value = issue.fields[field];
        console.log(`${field}: ${value !== null && value !== undefined ? JSON.stringify(value) : 'Non défini'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de l\'endpoint Jira:', error.response ? error.response.data : error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Erreur d\'authentification - Vérifiez votre API token Jira');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Erreur de permissions - Votre utilisateur n\'a peut-être pas les droits');
    }
  }
}

async function testPowerBIEndpoint() {
  try {
    console.log('🔍 Test de l\'API PowerBI comme fallback...\n');
    
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
    
    if (powerbiResponse.data.value) {
      console.log(`📊 ${powerbiResponse.data.value.length} entités PowerBI disponibles`);
      
      if (powerbiResponse.data.value.length > 0) {
        const entity = powerbiResponse.data.value[0];
        console.log(`\nPremière entité: ${entity.name} (${entity.kind})`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API PowerBI:', error.response ? error.response.data : error.message);
  }
}

testJiraFieldsEndpoint();
