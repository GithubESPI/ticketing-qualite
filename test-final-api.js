const axios = require('axios');

console.log('🔍 Test de l\'API finale avec descriptions...\n');

async function testFinalAPI() {
  try {
    // Tester l'API PowerBI directement
    console.log('📋 Test de l\'API PowerBI:');
    const response = await axios.get('http://localhost:3000/api/powerbi/issues?maxResults=5');
    
    if (response.data.success) {
      console.log(`✅ ${response.data.issues.length} issues récupérés`);
      console.log(`📊 Source: ${response.data.source}`);
      
      // Analyser les 3 premiers issues
      console.log('\n📝 Analyse des 3 premiers issues:');
      response.data.issues.slice(0, 3).forEach((issue, index) => {
        console.log(`\n--- Issue ${index + 1} ---`);
        console.log(`Clé: ${issue.key}`);
        console.log(`Résumé: ${issue.fields.summary.substring(0, 50)}...`);
        console.log(`Description: ${issue.fields.description ? issue.fields.description.substring(0, 50) + '...' : 'Aucune description'}`);
        console.log(`Statut: ${issue.fields.status?.name}`);
        console.log(`Priorité: ${issue.fields.priority?.name}`);
        console.log(`Assigné à: ${issue.fields.assignee?.displayName}`);
        console.log(`Reporter: ${issue.fields.reporter?.displayName}`);
        console.log(`Type: ${issue.fields.issuetype?.name}`);
        
        // Champs personnalisés
        console.log(`Action clôturée: ${issue.fields.customfield_10001}`);
        console.log(`Action corrective: ${issue.fields.customfield_10002?.substring(0, 30)}...`);
        console.log(`Action curative: ${issue.fields.customfield_10003?.substring(0, 30)}...`);
        console.log(`Date constatation: ${issue.fields.customfield_10004}`);
        console.log(`Date réalisation: ${issue.fields.customfield_10005}`);
        console.log(`Efficacité: ${issue.fields.customfield_10006}`);
        console.log(`Entité Origine: ${issue.fields.customfield_10007}`);
      });
      
      // Statistiques
      console.log('\n📊 Statistiques:');
      const statusCounts = {};
      const priorityCounts = {};
      const assigneeCounts = {};
      const descriptionCounts = { with: 0, without: 0 };
      
      response.data.issues.forEach(issue => {
        const status = issue.fields.status?.name || 'Inconnu';
        const priority = issue.fields.priority?.name || 'Inconnu';
        const assignee = issue.fields.assignee?.displayName || 'Non assigné';
        
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
        assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;
        
        if (issue.fields.description && issue.fields.description !== 'Description depuis PowerBI') {
          descriptionCounts.with++;
        } else {
          descriptionCounts.without++;
        }
      });
      
      console.log(`Statuts: ${JSON.stringify(statusCounts)}`);
      console.log(`Priorités: ${JSON.stringify(priorityCounts)}`);
      console.log(`Assignés: ${JSON.stringify(assigneeCounts)}`);
      console.log(`Descriptions: ${descriptionCounts.with} avec, ${descriptionCounts.without} sans`);
      
    } else {
      console.log(`❌ Erreur API: ${response.data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API:', error.response ? error.response.data : error.message);
  }
}

testFinalAPI();
