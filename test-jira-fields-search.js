const axios = require('axios');

// Remplacez par vos vraies credentials
const JIRA_BASE_URL = 'https://groupe-espi.atlassian.net';
const JIRA_EMAIL = 'informatique@groupe-espi.fr';
const JIRA_API_TOKEN = 'VOTRE_VRAIE_API_TOKEN_ICI'; // Remplacez par votre vraie API token

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

async function testJiraFieldsSearch() {
  console.log('🔍 Test de l\'endpoint /rest/api/3/field/search...\n');
  
  try {
    // 1. Test de l'endpoint de base
    console.log('📋 1. Test de l\'endpoint de base:');
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
      console.log('   ---');
    });

    // 4. Recherche par mots-clés qualité
    console.log('\n🎯 4. Recherche par mots-clés qualité:');
    const qualityKeywords = ['processus', 'origine', 'constatation', 'pilote', 'entité', 'qualité'];
    
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

    // 5. Recherche des champs de type custom
    console.log('\n🔧 5. Champs de type custom uniquement:');
    try {
      const customTypeResponse = await axiosInstance.get('/rest/api/3/field/search', {
        params: { type: 'custom' }
      });
      
      console.log(`Total champs custom: ${customTypeResponse.data.length}\n`);
      customTypeResponse.data.slice(0, 5).forEach((field, index) => {
        console.log(`${index + 1}. ${field.id} - ${field.name}`);
        console.log(`   Type: ${field.schema?.type || 'N/A'}`);
        console.log(`   Custom Type: ${field.schema?.custom || 'N/A'}`);
        console.log('   ---');
      });
    } catch (error) {
      console.log(`Erreur pour type=custom: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

    // 6. Résumé
    console.log('\n📊 Résumé:');
    console.log(`- Total champs: ${allFieldsResponse.data.length}`);
    console.log(`- Champs personnalisés: ${customFields.length}`);
    console.log(`- Champs standard: ${allFieldsResponse.data.length - customFields.length}`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des champs:', error.response ? error.response.data : error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Erreur d\'authentification - Vérifiez votre API token');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Erreur de permissions - Votre utilisateur n\'a peut-être pas les droits');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Endpoint non trouvé - Vérifiez l\'URL de votre instance Jira');
    }
  }
}

testJiraFieldsSearch();
