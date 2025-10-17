const axios = require('axios');

// Configuration avec votre token
const config = {
  jira: {
    baseUrl: 'https://groupe-espi.atlassian.net',
    email: 'informatique@groupe-espi.fr',
    apiToken: 'VOTRE_API_KEY_ICI', // Pas encore configuré
    projectKey: 'DYS',
    
    // Configuration PowerBI avec votre token
    powerbiUrl: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
  }
};

console.log('🔍 Analyse détaillée des données PowerBI...\n');

async function analyzePowerBIData() {
  try {
    const powerbiAuth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
    
    const powerbiResponse = await axios.get(config.jira.powerbiUrl, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Structure des données PowerBI:');
    console.log(`- Type: ${typeof powerbiResponse.data}`);
    console.log(`- Clés principales: ${Object.keys(powerbiResponse.data).join(', ')}`);
    
    if (powerbiResponse.data.value) {
      console.log(`\n📋 Entités disponibles (${powerbiResponse.data.value.length}):`);
      
      powerbiResponse.data.value.forEach((entity, index) => {
        console.log(`\n${index + 1}. ${entity.name} (${entity.kind})`);
        console.log(`   URL: ${entity.url}`);
        console.log(`   Type: ${entity.kind}`);
        
        // Analyser les champs de cette entité
        if (entity.fields) {
          console.log(`   Champs: ${entity.fields.length}`);
          entity.fields.forEach(field => {
            console.log(`     - ${field.name}: ${field.type}`);
          });
        }
      });
      
      // Recherche spécifique des champs qualité
      console.log('\n🎯 Analyse des champs qualité:');
      const qualityFields = [];
      
      powerbiResponse.data.value.forEach((entity, entityIndex) => {
        if (entity.fields) {
          entity.fields.forEach(field => {
            const fieldName = field.name.toLowerCase();
            if (fieldName.includes('processus') || 
                fieldName.includes('origine') || 
                fieldName.includes('constatation') || 
                fieldName.includes('pilote') || 
                fieldName.includes('entité') || 
                fieldName.includes('qualité') || 
                fieldName.includes('client') || 
                fieldName.includes('réclamation')) {
              qualityFields.push({
                entity: entity.name,
                field: field.name,
                type: field.type,
                entityIndex: entityIndex
              });
            }
          });
        }
      });
      
      if (qualityFields.length > 0) {
        console.log(`✅ Champs qualité trouvés (${qualityFields.length}):`);
        qualityFields.forEach((field, index) => {
          console.log(`${index + 1}. ${field.entity}.${field.field} (${field.type})`);
        });
      } else {
        console.log('Aucun champ qualité trouvé dans les entités');
      }
      
      // Recherche dans les noms d'entités
      console.log('\n🔍 Analyse des noms d\'entités:');
      const qualityEntities = powerbiResponse.data.value.filter(entity => {
        const entityName = entity.name.toLowerCase();
        return entityName.includes('processus') || 
               entityName.includes('origine') || 
               entityName.includes('constatation') || 
               entityName.includes('pilote') || 
               entityName.includes('entité') || 
               entityName.includes('qualité') || 
               entityName.includes('client') || 
               entityName.includes('réclamation') ||
               entityName.includes('issue') ||
               entityName.includes('ticket');
      });
      
      if (qualityEntities.length > 0) {
        console.log(`✅ Entités liées à la qualité (${qualityEntities.length}):`);
        qualityEntities.forEach((entity, index) => {
          console.log(`${index + 1}. ${entity.name} (${entity.kind})`);
          console.log(`   URL: ${entity.url}`);
        });
      } else {
        console.log('Aucune entité liée à la qualité trouvée');
      }
      
    } else {
      console.log('\n📊 Données PowerBI brutes:');
      console.log(JSON.stringify(powerbiResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des données PowerBI:', error.response ? error.response.data : error.message);
  }
}

analyzePowerBIData();
