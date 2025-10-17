'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, User, FolderOpen, Bug } from 'lucide-react';
import { testJiraConnection, getCurrentUser, getProjects, searchIssues } from '../api/jira';

interface JiraApiTesterProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function JiraApiTester({ isVisible, onClose }: JiraApiTesterProps) {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runJiraTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    const tests = [
      {
        name: 'Test de connexion Jira',
        description: 'Vérification de la connexion à l\'API Jira',
        icon: CheckCircle,
        test: async () => {
          const isConnected = await testJiraConnection();
          return {
            success: isConnected,
            message: isConnected ? 'Connexion réussie' : 'Échec de la connexion'
          };
        }
      },
      {
        name: 'Informations utilisateur',
        description: 'Récupération des informations de l\'utilisateur connecté',
        icon: User,
        test: async () => {
          const user = await getCurrentUser();
          return {
            success: true,
            message: `Utilisateur: ${user.displayName} (${user.emailAddress})`,
            data: user
          };
        }
      },
      {
        name: 'Liste des projets',
        description: 'Récupération de la liste des projets Jira',
        icon: FolderOpen,
        test: async () => {
          const projects = await getProjects();
          return {
            success: true,
            message: `${projects.length} projet(s) trouvé(s)`,
            data: projects
          };
        }
      },
      {
        name: 'Recherche d\'issues',
        description: 'Test de recherche d\'issues avec JQL',
        icon: Bug,
        test: async () => {
          const issues = await searchIssues({ maxResults: 10 });
          return {
            success: true,
            message: `${issues.total} issue(s) trouvé(s)`,
            data: issues
          };
        }
      }
    ];

    for (const test of tests) {
      try {
        console.log(`🧪 Test Jira: ${test.name}`);
        
        const result = await test.test();
        
        const testResult = {
          name: test.name,
          description: test.description,
          icon: test.icon,
          status: result.success ? 'success' : 'error',
          message: result.message,
          data: result.data
        };

        if (result.success) {
          console.log('✅ Succès:', result.message);
        } else {
          console.log('❌ Erreur:', result.message);
        }

        setTestResults(prev => [...prev, testResult]);
      } catch (error) {
        const testResult = {
          name: test.name,
          description: test.description,
          icon: test.icon,
          status: 'error',
          message: error instanceof Error ? error.message : 'Erreur inconnue',
          data: null
        };
        setTestResults(prev => [...prev, testResult]);
        console.log('❌ Erreur test Jira:', error);
      }
    }

    setIsTesting(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bug className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Testeur API Jira</h2>
              <p className="text-sm text-gray-600">Test de connexion à l'API Jira officielle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={runJiraTests}
              disabled={isTesting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isTesting
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Play className="w-4 h-4" />
              {isTesting ? 'Tests en cours...' : 'Lancer les tests Jira'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Résultats des tests</h3>
              {testResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 ${
                        result.status === 'success' ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium">{result.name}</span>
                        <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status === 'success' ? 'Succès' : 'Erreur'}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 mb-3">
                      {result.message}
                    </div>

                    {result.data && (
                      <div className="mt-3">
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-gray-600 hover:text-gray-800">
                            Voir les données
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Configuration requise</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>NEXT_PUBLIC_JIRA_BASE_URL</strong> : URL de votre instance Jira</p>
              <p>• <strong>NEXT_PUBLIC_JIRA_EMAIL</strong> : Votre email Atlassian</p>
              <p>• <strong>NEXT_PUBLIC_JIRA_API_TOKEN</strong> : Votre token API Jira</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
