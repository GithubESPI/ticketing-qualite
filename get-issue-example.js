const axios = require('axios');

// Configuration Jira
const JIRA_BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://groupe-espi.atlassian.net';
const JIRA_EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL || 'informatique@groupe-espi.fr';
const JIRA_API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_TOKEN || 'VOTRE_API_KEY_ICI';
const PROJECT_KEY = 'DYS';

// Fonction pour récupérer un exemple d'issue avec tous ses champs
async function getIssueExample() {
  try {
    console.log('🔍 Récupération d\'un exemple d\'issue DYS...');
    
    // D'abord, récupérer la liste des issues
    const searchResponse = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search`, {
      params: {
        jql: `project = "${PROJECT_KEY}" ORDER BY created DESC`,
        maxResults: 1,
        fields: '*all' // Récupérer tous les champs
      },
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (searchResponse.data.issues.length === 0) {
      console.log('❌ Aucun issue trouvé dans le projet DYS');
      return;
    }

    const issue = searchResponse.data.issues[0];
    console.log(`✅ Issue trouvée: ${issue.key}`);
    console.log(`📝 Résumé: ${issue.fields.summary}`);
    console.log('\n🔍 CHAMPS PERSONNALISÉS DANS CET ISSUE :');
    console.log('=' .repeat(80));

    // Analyser tous les champs de l'issue
    const customFields = {};
    Object.keys(issue.fields).forEach(key => {
      if (key.startsWith('customfield_')) {
        const value = issue.fields[key];
        if (value !== null && value !== undefined && value !== '') {
          customFields[key] = value;
        }
      }
    });

    if (Object.keys(customFields).length > 0) {
      Object.entries(customFields).forEach(([key, value]) => {
        console.log(`🔹 ${key}:`);
        console.log(`   Valeur: ${JSON.stringify(value, null, 2)}`);
        console.log(`   Type: ${typeof value}`);
        console.log('-'.repeat(40));
      });
    } else {
      console.log('❌ Aucun champ personnalisé trouvé dans cet issue');
    }

    // Générer le code TypeScript mis à jour
    console.log('\n💻 INTERFACE TYPESCRIPT MISE À JOUR :');
    console.log('=' .repeat(80));
    console.log('interface JiraIssue {');
    console.log('  id: string;');
    console.log('  key: string;');
    console.log('  fields: {');
    console.log('    summary: string;');
    console.log('    // ... autres champs standard ...');
    
    Object.keys(customFields).forEach(key => {
      const fieldName = key.replace('customfield_', 'customfield_');
      console.log(`    ${fieldName}?: any; // Champ personnalisé`);
    });
    
    console.log('  };');
    console.log('}');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'issue:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 VÉRIFIEZ VOS CRÉDENTIALS :');
      console.log('- Email Jira :', JIRA_EMAIL);
      console.log('- Token API :', JIRA_API_TOKEN ? '✅ Défini' : '❌ Manquant');
      console.log('- URL Base :', JIRA_BASE_URL);
    }
  }
}

// Exécuter le script
getIssueExample();
