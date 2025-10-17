const axios = require('axios');

// Configuration Jira
const JIRA_BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://groupe-espi.atlassian.net';
const JIRA_EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL || 'informatique@groupe-espi.fr';
const JIRA_API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_TOKEN || 'VOTRE_API_KEY_ICI';

// Fonction pour lister tous les champs Jira
async function getJiraFields() {
  try {
    console.log('🔍 Récupération des champs Jira...');
    
    const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/field`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ ${response.data.length} champs trouvés\n`);

    // Filtrer et afficher les champs personnalisés
    const customFields = response.data.filter(field => 
      field.id.startsWith('customfield_') && 
      field.custom === true
    );

    console.log('📋 CHAMPS PERSONNALISÉS DISPONIBLES :');
    console.log('=' .repeat(80));
    
    customFields.forEach(field => {
      console.log(`🔹 ID: ${field.id}`);
      console.log(`   Nom: ${field.name}`);
      console.log(`   Type: ${field.schema?.type || 'N/A'}`);
      console.log(`   Système: ${field.custom ? 'Personnalisé' : 'Standard'}`);
      console.log(`   Description: ${field.description || 'Aucune description'}`);
      console.log('-'.repeat(40));
    });

    // Rechercher spécifiquement les champs de qualité
    console.log('\n🎯 RECHERCHE DE CHAMPS QUALITÉ :');
    console.log('=' .repeat(80));
    
    const qualityFields = customFields.filter(field => 
      field.name.toLowerCase().includes('entité') ||
      field.name.toLowerCase().includes('processus') ||
      field.name.toLowerCase().includes('constatation') ||
      field.name.toLowerCase().includes('origine') ||
      field.name.toLowerCase().includes('pilote') ||
      field.name.toLowerCase().includes('qualité') ||
      field.name.toLowerCase().includes('réclamation')
    );

    if (qualityFields.length > 0) {
      qualityFields.forEach(field => {
        console.log(`✅ ${field.id} → ${field.name}`);
      });
    } else {
      console.log('❌ Aucun champ qualité trouvé avec les mots-clés');
    }

    // Générer le code TypeScript
    console.log('\n💻 CODE TYPESCRIPT À UTILISER :');
    console.log('=' .repeat(80));
    console.log('// Champs personnalisés identifiés');
    customFields.forEach(field => {
      const fieldName = field.id.replace('customfield_', 'customfield_');
      const comment = `// ${field.name}`;
      console.log(`${comment}`);
      console.log(`${fieldName}?: string;`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des champs:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 VÉRIFIEZ VOS CRÉDENTIALS :');
      console.log('- Email Jira :', JIRA_EMAIL);
      console.log('- Token API :', JIRA_API_TOKEN ? '✅ Défini' : '❌ Manquant');
      console.log('- URL Base :', JIRA_BASE_URL);
    }
  }
}

// Exécuter le script
getJiraFields();
