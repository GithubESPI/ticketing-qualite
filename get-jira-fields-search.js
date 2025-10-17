const axios = require('axios');
require('dotenv').config({ path: './.env.local' });

const JIRA_BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL;
const JIRA_EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_TOKEN;

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

async function getJiraFieldsSearch() {
  console.log('🔍 Recherche de tous les champs Jira avec le nouvel endpoint /field/search...\n');
  
  try {
    // 1. Récupérer tous les champs avec le nouvel endpoint
    console.log('📋 1. Tous les champs (nouvel endpoint):');
    const allFieldsResponse = await axiosInstance.get('/rest/api/3/field/search');
    console.log(`Total: ${allFieldsResponse.data.length} champs trouvés\n`);
    
    // Afficher tous les champs avec plus de détails
    allFieldsResponse.data.forEach((field, index) => {
      console.log(`${index + 1}. ID: ${field.id}`);
      console.log(`   Nom: ${field.name}`);
      console.log(`   Custom: ${field.custom || false}`);
      console.log(`   Type: ${field.schema?.type || 'N/A'}`);
      console.log(`   Custom Type: ${field.schema?.custom || 'N/A'}`);
      console.log(`   Orderable: ${field.orderable || false}`);
      console.log(`   Navigable: ${field.navigable || false}`);
      console.log(`   Searchable: ${field.searchable || false}`);
      if (field.clauseNames && field.clauseNames.length > 0) {
        console.log(`   Clause Names: ${field.clauseNames.join(', ')}`);
      }
      console.log('   ---');
    });

    // 2. Rechercher spécifiquement les champs personnalisés
    console.log('\n🔧 2. Champs personnalisés uniquement:');
    const customFields = allFieldsResponse.data.filter(field => field.custom === true);
    console.log(`Total champs personnalisés: ${customFields.length}\n`);
    
    customFields.forEach((field, index) => {
      console.log(`${index + 1}. ${field.id} - ${field.name}`);
      console.log(`   Type: ${field.schema?.type || 'N/A'}`);
      console.log(`   Custom Type: ${field.schema?.custom || 'N/A'}`);
      console.log('   ---');
    });

    // 3. Rechercher par mots-clés liés à la qualité
    console.log('\n🎯 3. Recherche par mots-clés qualité:');
    const qualityKeywords = ['processus', 'origine', 'constatation', 'pilote', 'entité', 'qualité', 'client'];
    
    for (const keyword of qualityKeywords) {
      try {
        console.log(`\n🔍 Recherche pour "${keyword}":`);
        const searchResponse = await axiosInstance.get('/rest/api/3/field/search', {
          params: { query: keyword }
        });
        
        if (searchResponse.data.length > 0) {
          searchResponse.data.forEach(field => {
            console.log(`   - ${field.id}: ${field.name} (${field.custom ? 'Custom' : 'Standard'})`);
          });
        } else {
          console.log(`   Aucun champ trouvé pour "${keyword}"`);
        }
      } catch (error) {
        console.log(`   Erreur pour "${keyword}": ${error.response?.data?.errorMessages?.[0] || error.message}`);
      }
    }

    // 4. Rechercher les champs de type custom uniquement
    console.log('\n🔧 4. Champs de type custom uniquement:');
    try {
      const customTypeResponse = await axiosInstance.get('/rest/api/3/field/search', {
        params: { type: 'custom' }
      });
      
      console.log(`Total champs custom: ${customTypeResponse.data.length}\n`);
      customTypeResponse.data.forEach((field, index) => {
        console.log(`${index + 1}. ${field.id} - ${field.name}`);
        console.log(`   Type: ${field.schema?.type || 'N/A'}`);
        console.log(`   Custom Type: ${field.schema?.custom || 'N/A'}`);
        console.log('   ---');
      });
    } catch (error) {
      console.log(`Erreur pour type=custom: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

    // 5. Résumé des champs personnalisés trouvés
    console.log('\n📊 5. Résumé des champs personnalisés:');
    const customFieldsSummary = customFields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.schema?.type || 'N/A',
      customType: field.schema?.custom || 'N/A'
    }));
    
    console.log(JSON.stringify(customFieldsSummary, null, 2));

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des champs:', error.response ? error.response.data : error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Vérifiez vos identifiants Jira dans le fichier .env.local');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Votre utilisateur n\'a peut-être pas les droits pour voir tous les champs');
    }
  }
}

getJiraFieldsSearch();
