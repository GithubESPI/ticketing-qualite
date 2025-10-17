const axios = require('axios');
require('dotenv').config({ path: './.env.local' });

const JIRA_BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL;
const JIRA_EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY || 'DYS';

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Veuillez configurer NEXT_PUBLIC_JIRA_BASE_URL, NEXT_PUBLIC_JIRA_EMAIL et NEXT_PUBLIC_JIRA_API_TOKEN dans votre fichier .env.local');
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

const axiosInstance = axios.create({
  baseURL: JIRA_BASE_URL,
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

async function getDYSProjectFields() {
  console.log(`🔍 Recherche des champs spécifiques au projet ${JIRA_PROJECT_KEY}...\n`);
  
  try {
    // 1. Récupérer les détails du projet DYS
    console.log(`📋 1. Détails du projet ${JIRA_PROJECT_KEY}:`);
    const projectResponse = await axiosInstance.get(`/rest/api/3/project/${JIRA_PROJECT_KEY}`);
    console.log(`Projet: ${projectResponse.data.name} (${projectResponse.data.key})`);
    console.log(`Description: ${projectResponse.data.description || 'Aucune description'}`);
    console.log(`Lead: ${projectResponse.data.lead?.displayName || 'N/A'}`);
    console.log('---\n');

    // 2. Récupérer les types d'issues du projet
    console.log('📋 2. Types d\'issues du projet:');
    const issueTypesResponse = await axiosInstance.get(`/rest/api/3/project/${JIRA_PROJECT_KEY}`);
    const issueTypes = projectResponse.data.issueTypes || [];
    issueTypes.forEach((issueType, index) => {
      console.log(`${index + 1}. ${issueType.name} (${issueType.id})`);
      console.log(`   Description: ${issueType.description || 'N/A'}`);
      console.log(`   Icon: ${issueType.iconUrl || 'N/A'}`);
      console.log('   ---');
    });

    // 3. Récupérer les champs disponibles pour le projet
    console.log('\n🔧 3. Champs disponibles pour le projet:');
    try {
      // Utiliser l'endpoint de recherche avec le contexte du projet
      const projectFieldsResponse = await axiosInstance.get('/rest/api/3/field/search', {
        params: { 
          projectId: projectResponse.data.id,
          expand: 'projects'
        }
      });
      
      console.log(`Total champs pour le projet: ${projectFieldsResponse.data.length}\n`);
      
      // Filtrer les champs personnalisés
      const customFields = projectFieldsResponse.data.filter(field => field.custom === true);
      console.log(`Champs personnalisés du projet: ${customFields.length}\n`);
      
      customFields.forEach((field, index) => {
        console.log(`${index + 1}. ${field.id} - ${field.name}`);
        console.log(`   Type: ${field.schema?.type || 'N/A'}`);
        console.log(`   Custom Type: ${field.schema?.custom || 'N/A'}`);
        console.log(`   Orderable: ${field.orderable || false}`);
        console.log(`   Searchable: ${field.searchable || false}`);
        if (field.clauseNames && field.clauseNames.length > 0) {
          console.log(`   Clause Names: ${field.clauseNames.join(', ')}`);
        }
        console.log('   ---');
      });

    } catch (error) {
      console.log(`Erreur pour les champs du projet: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

    // 4. Récupérer un exemple d'issue du projet pour voir les champs utilisés
    console.log('\n📋 4. Exemple d\'issue du projet:');
    try {
      // Récupérer les premières issues du projet
      const issuesResponse = await axiosInstance.get('/rest/api/3/search', {
        params: {
          jql: `project = ${JIRA_PROJECT_KEY}`,
          maxResults: 1,
          fields: '*all'
        }
      });

      if (issuesResponse.data.issues && issuesResponse.data.issues.length > 0) {
        const issue = issuesResponse.data.issues[0];
        console.log(`Issue exemple: ${issue.key} - ${issue.fields.summary}`);
        console.log('Champs personnalisés trouvés dans cette issue:');
        
        // Lister tous les champs personnalisés de cette issue
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
      console.log(`Erreur pour l'exemple d'issue: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

    // 5. Recherche spécifique pour les champs qualité
    console.log('\n🎯 5. Recherche de champs liés à la qualité:');
    const qualityTerms = ['processus', 'origine', 'constatation', 'pilote', 'entité', 'qualité', 'client', 'réclamation'];
    
    for (const term of qualityTerms) {
      try {
        console.log(`\n🔍 Recherche pour "${term}":`);
        const searchResponse = await axiosInstance.get('/rest/api/3/field/search', {
          params: { 
            query: term,
            projectId: projectResponse.data.id
          }
        });
        
        if (searchResponse.data.length > 0) {
          searchResponse.data.forEach(field => {
            console.log(`   - ${field.id}: ${field.name} (${field.custom ? 'Custom' : 'Standard'})`);
            console.log(`     Type: ${field.schema?.type || 'N/A'}`);
            console.log(`     Custom Type: ${field.schema?.custom || 'N/A'}`);
          });
        } else {
          console.log(`   Aucun champ trouvé pour "${term}"`);
        }
      } catch (error) {
        console.log(`   Erreur pour "${term}": ${error.response?.data?.errorMessages?.[0] || error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des informations du projet:', error.response ? error.response.data : error.message);
    
    if (error.response?.status === 404) {
      console.log(`\n💡 Le projet ${JIRA_PROJECT_KEY} n'existe pas ou vous n'y avez pas accès`);
    } else if (error.response?.status === 401) {
      console.log('\n💡 Vérifiez vos identifiants Jira dans le fichier .env.local');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Votre utilisateur n\'a peut-être pas les droits pour voir ce projet');
    }
  }
}

getDYSProjectFields();
