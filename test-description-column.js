const axios = require('axios');

console.log('🔍 Test de la colonne Description dans le tableau...\n');

async function testDescriptionColumn() {
  try {
    // Tester l'API PowerBI
    console.log('📋 Test de l\'API PowerBI avec colonne Description:');
    const response = await axios.get('http://localhost:3000/api/powerbi/issues?maxResults=5');
    
    if (response.data.success) {
      console.log(`✅ ${response.data.issues.length} issues récupérés`);
      console.log(`📊 Source: ${response.data.source}`);
      
      // Analyser les descriptions
      console.log('\n📝 Analyse des descriptions:');
      response.data.issues.forEach((issue, index) => {
        console.log(`\n--- Issue ${index + 1} ---`);
        console.log(`Clé: ${issue.key}`);
        console.log(`Résumé: ${issue.fields.summary.substring(0, 50)}...`);
        
        if (issue.fields.description) {
          const cleanDescription = issue.fields.description.replace(/<[^>]*>/g, '');
          console.log(`Description: ${cleanDescription.substring(0, 100)}...`);
          console.log(`Longueur: ${cleanDescription.length} caractères`);
          console.log(`Aperçu (120 chars): ${cleanDescription.substring(0, 120)}...`);
        } else {
          console.log('Description: Aucune description');
        }
        
        console.log(`Statut: ${issue.fields.status?.name}`);
        console.log(`Priorité: ${issue.fields.priority?.name}`);
        console.log(`Assigné à: ${issue.fields.assignee?.displayName}`);
      });
      
      // Statistiques des descriptions
      console.log('\n📊 Statistiques des descriptions:');
      const descriptionStats = {
        withDescription: 0,
        withoutDescription: 0,
        totalLength: 0,
        averageLength: 0,
        maxLength: 0,
        minLength: Infinity
      };
      
      response.data.issues.forEach(issue => {
        if (issue.fields.description && issue.fields.description !== 'Description depuis PowerBI') {
          const cleanDescription = issue.fields.description.replace(/<[^>]*>/g, '');
          descriptionStats.withDescription++;
          descriptionStats.totalLength += cleanDescription.length;
          descriptionStats.maxLength = Math.max(descriptionStats.maxLength, cleanDescription.length);
          descriptionStats.minLength = Math.min(descriptionStats.minLength, cleanDescription.length);
        } else {
          descriptionStats.withoutDescription++;
        }
      });
      
      if (descriptionStats.withDescription > 0) {
        descriptionStats.averageLength = Math.round(descriptionStats.totalLength / descriptionStats.withDescription);
      }
      
      console.log(`✅ Issues avec description: ${descriptionStats.withDescription}`);
      console.log(`❌ Issues sans description: ${descriptionStats.withoutDescription}`);
      console.log(`📏 Longueur moyenne: ${descriptionStats.averageLength} caractères`);
      console.log(`📏 Longueur maximale: ${descriptionStats.maxLength} caractères`);
      console.log(`📏 Longueur minimale: ${descriptionStats.minLength === Infinity ? 'N/A' : descriptionStats.minLength} caractères`);
      
      // Test de l'aperçu dans le tableau
      console.log('\n🔍 Test de l\'aperçu dans le tableau:');
      response.data.issues.slice(0, 3).forEach((issue, index) => {
        if (issue.fields.description) {
          const cleanDescription = issue.fields.description.replace(/<[^>]*>/g, '');
          const preview = cleanDescription.substring(0, 120);
          console.log(`\nIssue ${index + 1} (${issue.key}):`);
          console.log(`Aperçu: "${preview}..."`);
          console.log(`Longueur aperçu: ${preview.length} caractères`);
          console.log(`Troncature: ${cleanDescription.length > 120 ? 'Oui' : 'Non'}`);
        }
      });
      
    } else {
      console.log(`❌ Erreur API: ${response.data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response ? error.response.data : error.message);
  }
}

testDescriptionColumn();
