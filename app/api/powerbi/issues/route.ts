import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '100');

    console.log('🔍 Récupération des issues depuis PowerBI...');

    // Configuration PowerBI
    const powerbiUrl = 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b';
    const email = 'informatique@groupe-espi.fr';
    const token = '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40=';
    
    const powerbiAuth = Buffer.from(`${email}:${token}`).toString('base64');

    // 1. Récupérer les issues depuis PowerBI
    const issuesResponse = await axios.get(`${powerbiUrl}/Issues`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const issuesData = issuesResponse.data.value || [];
    console.log(`✅ ${issuesData.length} issues récupérés depuis PowerBI`);

    // 2. Récupérer les entités d'origine
    const entiteResponse = await axios.get(`${powerbiUrl}/Entité_Origine_de_la_réclamation_10117`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const entiteData = entiteResponse.data.value || [];
    console.log(`✅ ${entiteData.length} entités d'origine récupérées`);

    // 3. Mapper les données PowerBI vers le format Jira
    const mappedIssues = issuesData.slice(0, maxResults).map((issue: any, index: number) => {
      // Trouver l'entité correspondante
      const correspondingEntite = entiteData.find((entite: any) => 
        entite.ISSUE_KEY === issue.ISSUE_KEY || entite.ISSUE_ID === issue.ISSUE_ID
      );

      return {
        id: `powerbi-${index}`,
        key: issue.ISSUE_KEY || `DYS-${index + 1}`,
        fields: {
          summary: issue.Action_corrective__10123 || issue.Action_curative__10122 || 'Issue PowerBI',
          status: {
            name: issue.Action_clôturée__oui_non__10128 === 'Oui' ? 'Terminé' : 'En cours'
          },
          priority: {
            name: issue.Efficacité_de_l_action_10127 === 'EFFICACE' ? 'Haute' : 'Normale'
          },
          assignee: {
            displayName: correspondingEntite?.Entité_Origine_de_la_réclamation || 'Système Qualité',
            avatarUrls: {
              '24x24': '/default-avatar.png'
            }
          },
          reporter: {
            displayName: correspondingEntite?.Entité_Origine_de_la_réclamation || 'Système Qualité',
            avatarUrls: {
              '24x24': '/default-avatar.png'
            }
          },
          created: issue.Date_de_la_constatation_10120 ? new Date(issue.Date_de_la_constatation_10120).toISOString() : new Date().toISOString(),
          updated: issue.Date_effective_de_réalisation_10130 ? new Date(issue.Date_effective_de_réalisation_10130).toISOString() : new Date().toISOString(),
          description: issue.Action_corrective__10123 || issue.Action_curative__10122 || 'Description depuis PowerBI',
          issuetype: {
            name: issue.Action_clôturée__oui_non__10128 === 'Oui' ? 'Task' : 'Bug',
            iconUrl: '/jira-bug-icon.png'
          },
          project: {
            key: 'DYS',
            name: 'Ticketing Qualité'
          },
          // Champs personnalisés mappés depuis PowerBI
          customfield_10001: issue.Action_clôturée__oui_non__10128 || 'Non défini', // Action clôturée
          customfield_10002: issue.Action_corrective__10123 || 'Non défini', // Action corrective
          customfield_10003: issue.Action_curative__10122 || 'Non défini', // Action curative
          customfield_10004: issue.Date_de_la_constatation_10120 || 'Non défini', // Date de constatation
          customfield_10005: issue.Date_effective_de_réalisation_10130 || 'Non défini', // Date effective de réalisation
          customfield_10006: issue.Efficacité_de_l_action_10127 || 'Non défini', // Efficacité de l'action
          customfield_10007: correspondingEntite?.Entité_Origine_de_la_réclamation || 'Non défini' // Entité Origine
        }
      };
    });

    console.log(`📊 ${mappedIssues.length} issues mappés depuis PowerBI`);

    // 4. Analyser les champs utilisés
    const usedCustomFields = new Set();
    mappedIssues.forEach((issue: any) => {
      Object.keys(issue.fields).forEach(fieldKey => {
        if (fieldKey.startsWith('customfield_') && issue.fields[fieldKey] !== 'Non défini') {
          usedCustomFields.add(fieldKey);
        }
      });
    });

    console.log(`🔍 Champs personnalisés utilisés: ${Array.from(usedCustomFields).join(', ')}`);

    return NextResponse.json({
      success: true,
      issues: mappedIssues,
      source: 'PowerBI API avec mapping vers format Jira',
      usedCustomFields: Array.from(usedCustomFields),
      totalIssues: mappedIssues.length,
      powerbiIssues: issuesData.length,
      powerbiEntites: entiteData.length
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des issues PowerBI:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      error: error.response?.data?.errorMessages?.[0] || error.message || 'Erreur lors de la récupération des issues PowerBI',
      source: 'PowerBI API'
    }, { status: 500 });
  }
}
