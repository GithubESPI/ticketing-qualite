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

// Vérification des credentials
if (config.jira.apiToken === 'VOTRE_API_KEY_ICI') {
  console.error('❌ API Token Jira non configuré !');
  console.log('\n💡 Pour configurer votre API token :');
  console.log('1. Créez un fichier .env.local à la racine du projet');
  console.log('2. Ajoutez : NEXT_PUBLIC_JIRA_API_TOKEN=votre-vraie-api-token');
  console.log('3. Ou modifiez directement config.jira.apiToken dans ce script');
  console.log('\n🔗 Pour obtenir votre API token :');
  console.log('https://id.atlassian.com/manage/api-tokens');
  process.exit(1);
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

async function testJiraFieldsWithConfig() {
  console.log('🔍 Test des champs Jira avec la configuration de env.ts...\n');
  
  try {
    // 1. Test de l'endpoint de base
    console.log('📋 1. Test de l\'endpoint /rest/api/3/field/search:');
    const allFieldsResponse = await axiosInstance.get('/rest/api/3/field/search');
    console.log(`✅ Succès ! Total: ${allFieldsResponse.data.length} champs trouvés\n`);
    
    // 2. Filtrer les champs personnalisés
    const customFields = allFieldsResponse.data.filter(field => field.custom === true);
    console.log(`🔧 Champs personnalisés: ${customFields.length}\n`);
    
    // 3. Afficher les premiers champs personnalisés
    console.log('📊 Premiers champs personnalisés:');
    customFields.slice(0, 10).forEach((field, index) => {
      console.log(`${index + 1}. ${field.id} - ${field.name}`);
      console.log(`   Type: ${field.schema?.type || 'N/A'}`);
      console.log(`   Custom Type: ${field.schema?.custom || 'N/A'}`);
      console.log(`   Orderable: ${field.orderable || false}`);
      console.log(`   Searchable: ${field.searchable || false}`);
      console.log('   ---');
    });

    // 4. Recherche par mots-clés qualité
    console.log('\n🎯 4. Recherche par mots-clés qualité:');
    const qualityKeywords = ['processus', 'origine', 'constatation', 'pilote', 'entité', 'qualité', 'client', 'réclamation'];
    
    for (const keyword of qualityKeywords) {
      try {
        console.log(`\n🔍 Recherche pour "${keyword}":`);
        const searchResponse = await axiosInstance.get('/rest/api/3/field/search', {
          params: { query: keyword }
        });
        
        if (searchResponse.data.length > 0) {
          searchResponse.data.forEach(field => {
            console.log(`   - ${field.id}: ${field.name} (${field.custom ? 'Custom' : 'Standard'})`);
            console.log(`     Type: ${field.schema?.type || 'N/A'}`);
            console.log(`     Custom Type: ${field.schema?.custom || 'N/A'}`);
          });
        } else {
          console.log(`   Aucun champ trouvé pour "${keyword}"`);
        }
      } catch (error) {
        console.log(`   Erreur pour "${keyword}": ${error.response?.data?.errorMessages?.[0] || error.message}`);
      }
    }

    // 5. Test du projet DYS
    console.log(`\n📋 5. Test du projet ${config.jira.projectKey}:`);
    try {
      const projectResponse = await axiosInstance.get(`/rest/api/3/project/${config.jira.projectKey}`);
      console.log(`✅ Projet trouvé: ${projectResponse.data.name} (${projectResponse.data.key})`);
      console.log(`Description: ${projectResponse.data.description || 'Aucune description'}`);
      console.log(`Lead: ${projectResponse.data.lead?.displayName || 'N/A'}`);
      
      // Récupérer un exemple d'issue du projet
      console.log('\n📋 Exemple d\'issue du projet:');
      const issuesResponse = await axiosInstance.get('/rest/api/3/search', {
        params: {
          jql: `project = ${config.jira.projectKey}`,
          maxResults: 1,
          fields: '*all'
        }
      });

      if (issuesResponse.data.issues && issuesResponse.data.issues.length > 0) {
        const issue = issuesResponse.data.issues[0];
        console.log(`✅ Issue exemple: ${issue.key} - ${issue.fields.summary}`);
        console.log('Champs personnalisés trouvés dans cette issue:');
        
        const customFieldsInIssue = [];
        for (const [fieldKey, fieldValue] of Object.entries(issue.fields)) {
          if (fieldKey.startsWith('customfield_') && fieldValue !== null && fieldValue !== undefined) {
            customFieldsInIssue.push({
              field: fieldKey,
              value: fieldValue,
              type: typeof fieldValue
            });
          }
        }

        if (customFieldsInIssue.length > 0) {
          customFieldsInIssue.forEach((field, index) => {
            console.log(`${index + 1}. ${field.field}: ${JSON.stringify(field.value)} (${field.type})`);
          });
        } else {
          console.log('Aucun champ personnalisé trouvé dans cette issue');
        }
      } else {
        console.log('Aucune issue trouvée dans le projet');
      }

    } catch (error) {
      console.log(`Erreur pour le projet: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

    // 6. Résumé
    console.log('\n📊 Résumé:');
    console.log(`- Configuration: ${config.jira.baseUrl}`);
    console.log(`- Projet: ${config.jira.projectKey}`);
    console.log(`- Total champs: ${allFieldsResponse.data.length}`);
    console.log(`- Champs personnalisés: ${customFields.length}`);
    console.log(`- Champs standard: ${allFieldsResponse.data.length - customFields.length}`);

    // 7. Génération du code TypeScript
    console.log('\n🔧 Code TypeScript généré:');
    console.log('// Champs personnalisés identifiés:');
    customFields.forEach(field => {
      console.log(`// ${field.id}: ${field.name} (${field.schema?.type || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des champs:', error.response ? error.response.data : error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Erreur d\'authentification - Vérifiez votre API token dans la configuration');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Erreur de permissions - Votre utilisateur n\'a peut-être pas les droits');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Endpoint non trouvé - Vérifiez l\'URL de votre instance Jira');
    }
  }
}

testJiraFieldsWithConfig();
