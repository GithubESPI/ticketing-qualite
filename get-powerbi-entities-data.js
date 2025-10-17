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

console.log('🔍 Récupération des données des entités PowerBI...\n');

async function getPowerBIEntitiesData() {
  try {
    const powerbiAuth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
    
    // 1. Récupérer la liste des entités
    console.log('📋 1. Liste des entités disponibles:');
    const entitiesResponse = await axios.get(config.jira.powerbiUrl, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${entitiesResponse.data.value.length} entités trouvées\n`);
    
    // 2. Analyser chaque entité
    for (let i = 0; i < entitiesResponse.data.value.length; i++) {
      const entity = entitiesResponse.data.value[i];
      console.log(`\n📊 ${i + 1}. ${entity.name} (${entity.kind})`);
      console.log(`URL: ${entity.url}`);
      
      try {
        // Récupérer les données de cette entité
        const entityUrl = `${config.jira.powerbiUrl}/${entity.url}`;
        console.log(`🔍 Récupération des données depuis: ${entityUrl}`);
        
        const entityDataResponse = await axios.get(entityUrl, {
          headers: {
            'Authorization': `Basic ${powerbiAuth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Données récupérées !`);
        console.log(`Type: ${typeof entityDataResponse.data}`);
        
        if (entityDataResponse.data.value) {
          console.log(`Nombre d'éléments: ${entityDataResponse.data.value.length}`);
          
          if (entityDataResponse.data.value.length > 0) {
            console.log('\nPremier élément:');
            console.log(JSON.stringify(entityDataResponse.data.value[0], null, 2));
            
            console.log('\nChamps disponibles:');
            Object.keys(entityDataResponse.data.value[0]).forEach((key, index) => {
              const value = entityDataResponse.data.value[0][key];
              console.log(`${index + 1}. ${key}: ${typeof value} = ${JSON.stringify(value)}`);
            });
          }
        } else {
          console.log('Structure des données:');
          console.log(JSON.stringify(entityDataResponse.data, null, 2));
        }
        
      } catch (error) {
        console.log(`❌ Erreur pour ${entity.name}: ${error.response?.data?.errorMessages?.[0] || error.message}`);
      }
    }
    
    // 3. Focus sur l'entité Issues
    console.log('\n🎯 3. Analyse spécifique de l\'entité Issues:');
    try {
      const issuesUrl = `${config.jira.powerbiUrl}/Issues`;
      const issuesResponse = await axios.get(issuesUrl, {
        headers: {
          'Authorization': `Basic ${powerbiAuth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (issuesResponse.data.value) {
        console.log(`✅ Issues récupérés: ${issuesResponse.data.value.length} éléments`);
        
        if (issuesResponse.data.value.length > 0) {
          console.log('\nPremier issue:');
          console.log(JSON.stringify(issuesResponse.data.value[0], null, 2));
          
          console.log('\nChamps disponibles dans les issues:');
          Object.keys(issuesResponse.data.value[0]).forEach((key, index) => {
            const value = issuesResponse.data.value[0][key];
            console.log(`${index + 1}. ${key}: ${typeof value} = ${JSON.stringify(value)}`);
          });
          
          // Recherche de champs qualité dans les issues
          console.log('\n🔍 Recherche de champs qualité dans les issues:');
          const qualityFields = [];
          Object.keys(issuesResponse.data.value[0]).forEach(key => {
            const fieldName = key.toLowerCase();
            if (fieldName.includes('processus') || 
                fieldName.includes('origine') || 
                fieldName.includes('constatation') || 
                fieldName.includes('pilote') || 
                fieldName.includes('entité') || 
                fieldName.includes('qualité') || 
                fieldName.includes('client') || 
                fieldName.includes('réclamation')) {
              qualityFields.push({
                field: key,
                value: issuesResponse.data.value[0][key],
                type: typeof issuesResponse.data.value[0][key]
              });
            }
          });
          
          if (qualityFields.length > 0) {
            console.log(`✅ Champs qualité trouvés (${qualityFields.length}):`);
            qualityFields.forEach((field, index) => {
              console.log(`${index + 1}. ${field.field}: ${field.value} (${field.type})`);
            });
          } else {
            console.log('Aucun champ qualité trouvé dans les issues');
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Erreur pour l'entité Issues: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données PowerBI:', error.response ? error.response.data : error.message);
  }
}

getPowerBIEntitiesData();
