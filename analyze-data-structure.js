// Analyse de la structure des données PowerBI
const axios = require('axios');

const POWERBI_CONFIG = {
  url: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

async function analyzeDataStructure() {
  try {
    console.log('🔍 Analyse de la structure des données PowerBI...\n');
    
    const response = await axios.get(POWERBI_CONFIG.url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${POWERBI_CONFIG.email}:${POWERBI_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('📊 Structure générale:');
    console.log('Keys:', Object.keys(response.data));
    console.log('Type:', typeof response.data);
    console.log('OData context:', response.data['@odata.context']);
    
    const tickets = response.data.value;
    console.log('\n🎫 Tickets (value array):');
    console.log('Nombre:', tickets.length);
    console.log('Type:', typeof tickets);
    console.log('Is Array:', Array.isArray(tickets));
    
    if (tickets.length > 0) {
      console.log('\n📋 Structure du premier ticket:');
      const firstTicket = tickets[0];
      console.log('Keys:', Object.keys(firstTicket));
      console.log('Valeurs:', JSON.stringify(firstTicket, null, 2));
      
      console.log('\n📋 Structure du deuxième ticket:');
      if (tickets.length > 1) {
        const secondTicket = tickets[1];
        console.log('Keys:', Object.keys(secondTicket));
        console.log('Valeurs:', JSON.stringify(secondTicket, null, 2));
      }
    }
    
    // Mapping suggéré
    console.log('\n🔄 Mapping suggéré:');
    if (tickets.length > 0) {
      const ticket = tickets[0];
      const mapping = {
        id: ticket.id || ticket.key || ticket.ticket_id || 'N/A',
        summary: ticket.summary || ticket.title || ticket.subject || ticket.description || 'N/A',
        status: ticket.status || ticket.state || ticket.workflow_state || 'N/A',
        priority: ticket.priority || ticket.severity || 'N/A',
        assignee: ticket.assignee || ticket.assigned_to || ticket.owner || ticket.user_name || 'N/A',
        created: ticket.created || ticket.created_date || ticket.date_created || ticket.created_at || 'N/A',
        description: ticket.description || ticket.details || ticket.content || ticket.body || 'N/A'
      };
      
      console.log('Mapping résultant:', JSON.stringify(mapping, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

analyzeDataStructure();
