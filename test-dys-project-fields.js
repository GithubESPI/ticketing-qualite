const axios = require('axios');

// Remplacez par vos vraies credentials
const JIRA_BASE_URL = 'https://groupe-espi.atlassian.net';
const JIRA_EMAIL = 'informatique@groupe-espi.fr';
const JIRA_API_TOKEN = 'VOTRE_VRAIE_API_TOKEN_ICI'; // Remplacez par votre vraie API token
const JIRA_PROJECT_KEY = 'DYS';

if (JIRA_API_TOKEN === 'VOTRE_VRAIE_API_TOKEN_ICI') {
  console.error('❌ Veuillez remplacer JIRA_API_TOKEN par votre vraie API token dans le script');
  console.log('\n💡 Pour obtenir votre API token :');
  console.log('1. Allez sur https://id.atlassian.com/manage/api-tokens');
  console.log('2. Cliquez sur "Create API token"');
  console.log('3. Donnez un nom (ex: "Dashboard DYS")');
  console.log('4. Copiez le token généré');
  console.log('5. Remplacez JIRA_API_TOKEN dans ce script');
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

async function testDYSProjectFields() {
  console.log(`🔍 Test des champs spécifiques au projet ${JIRA_PROJECT_KEY}...\n`);
  
  try {
    // 1. Récupérer les détails du projet DYS
    console.log(`📋 1. Détails du projet ${JIRA_PROJECT_KEY}:`);
    const projectResponse = await axiosInstance.get(`/rest/api/3/project/${JIRA_PROJECT_KEY}`);
    console.log(`✅ Projet trouvé: ${projectResponse.data.name} (${projectResponse.data.key})`);
    console.log(`Description: ${projectResponse.data.description || 'Aucune description'}`);
    console.log(`Lead: ${projectResponse.data.lead?.displayName || 'N/A'}`);
    console.log('---\n');

    // 2. Récupérer les types d'issues du projet
    console.log('📋 2. Types d\'issues du projet:');
    const issueTypes = projectResponse.data.issueTypes || [];
    issueTypes.forEach((issueType, index) => {
      console.log(`${index + 1}. ${issueType.name} (${issueType.id})`);
      console.log(`   Description: ${issueType.description || 'N/A'}`);
      console.log('   ---');
    });

    // 3. Récupérer les champs avec le nouvel endpoint
    console.log('\n🔧 3. Champs avec le nouvel endpoint /field/search:');
    const allFieldsResponse = await axiosInstance.get('/rest/api/3/field/search');
    console.log(`Total champs disponibles: ${allFieldsResponse.data.length}`);
    
    const customFields = allFieldsResponse.data.filter(field => field.custom === true);
    console.log(`Champs personnalisés: ${customFields.length}\n`);

    // 4. Recherche spécifique pour les champs qualité
    console.log('🎯 4. Recherche de champs liés à la qualité:');
    const qualityTerms = ['processus', 'origine', 'constatation', 'pilote', 'entité', 'qualité', 'client', 'réclamation'];
    
    for (const term of qualityTerms) {
      try {
        console.log(`\n🔍 Recherche pour "${term}":`);
        const searchResponse = await axiosInstance.get('/rest/api/3/field/search', {
          params: { query: term }
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

    // 5. Récupérer un exemple d'issue du projet
    console.log('\n📋 5. Exemple d\'issue du projet:');
    try {
      const issuesResponse = await axiosInstance.get('/rest/api/3/search', {
        params: {
          jql: `project = ${JIRA_PROJECT_KEY}`,
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
      console.log(`Erreur pour l'exemple d'issue: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

    // 6. Résumé
    console.log('\n📊 Résumé:');
    console.log(`- Projet: ${projectResponse.data.name} (${projectResponse.data.key})`);
    console.log(`- Types d'issues: ${issueTypes.length}`);
    console.log(`- Total champs: ${allFieldsResponse.data.length}`);
    console.log(`- Champs personnalisés: ${customFields.length}`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des informations du projet:', error.response ? error.response.data : error.message);
    
    if (error.response?.status === 404) {
      console.log(`\n💡 Le projet ${JIRA_PROJECT_KEY} n'existe pas ou vous n'y avez pas accès`);
    } else if (error.response?.status === 401) {
      console.log('\n💡 Erreur d\'authentification - Vérifiez votre API token');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Erreur de permissions - Votre utilisateur n\'a peut-être pas les droits');
    }
  }
}

testDYSProjectFields();
