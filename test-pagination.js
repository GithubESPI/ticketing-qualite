const axios = require('axios');

console.log('🔍 Test de la pagination...\n');

async function testPagination() {
  try {
    // Tester l'API PowerBI
    console.log('📋 Test de l\'API PowerBI avec pagination:');
    const response = await axios.get('http://localhost:3000/api/powerbi/issues?maxResults=100');
    
    if (response.data.success) {
      console.log(`✅ ${response.data.issues.length} issues récupérés`);
      console.log(`📊 Source: ${response.data.source}`);
      
      // Simuler la pagination
      const itemsPerPage = 10;
      const totalIssues = response.data.issues.length;
      const totalPages = Math.ceil(totalIssues / itemsPerPage);
      
      console.log(`\n📊 Statistiques de pagination:`);
      console.log(`- Total issues: ${totalIssues}`);
      console.log(`- Éléments par page: ${itemsPerPage}`);
      console.log(`- Nombre de pages: ${totalPages}`);
      
      // Tester les différentes pages
      console.log(`\n📄 Test des pages:`);
      for (let page = 1; page <= Math.min(3, totalPages); page++) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageIssues = response.data.issues.slice(startIndex, endIndex);
        
        console.log(`\n--- Page ${page} ---`);
        console.log(`Index: ${startIndex + 1} à ${Math.min(endIndex, totalIssues)}`);
        console.log(`Issues: ${pageIssues.length}`);
        console.log(`Premier issue: ${pageIssues[0]?.key || 'N/A'}`);
        console.log(`Dernier issue: ${pageIssues[pageIssues.length - 1]?.key || 'N/A'}`);
      }
      
      // Test des options de pagination
      console.log(`\n⚙️ Test des options de pagination:`);
      const paginationOptions = [5, 10, 20, 50];
      
      paginationOptions.forEach(option => {
        const pages = Math.ceil(totalIssues / option);
        console.log(`${option} par page: ${pages} pages`);
      });
      
      // Test de recherche avec pagination
      console.log(`\n🔍 Test de recherche avec pagination:`);
      const searchTerm = 'action';
      const filteredIssues = response.data.issues.filter(issue => 
        issue.fields.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.fields.description && issue.fields.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      console.log(`Recherche "${searchTerm}": ${filteredIssues.length} résultats`);
      if (filteredIssues.length > 0) {
        const filteredPages = Math.ceil(filteredIssues.length / itemsPerPage);
        console.log(`Pages filtrées: ${filteredPages}`);
        
        // Afficher la première page filtrée
        const firstPageFiltered = filteredIssues.slice(0, itemsPerPage);
        console.log(`Première page filtrée: ${firstPageFiltered.length} issues`);
        firstPageFiltered.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.key}: ${issue.fields.summary.substring(0, 50)}...`);
        });
      }
      
    } else {
      console.log(`❌ Erreur API: ${response.data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response ? error.response.data : error.message);
  }
}

testPagination();
