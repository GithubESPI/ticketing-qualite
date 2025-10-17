'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { API_CONFIGS, testApiConfig } from '../config/api-configs';

interface ApiTesterProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ApiTester({ isVisible, onClose }: ApiTesterProps) {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testApiConnection = async () => {
    setIsTesting(true);
    setTestResults([]);

    console.log('🧪 Début des tests API avec', API_CONFIGS.length, 'configurations');

    for (const config of API_CONFIGS) {
      try {
        console.log(`🧪 Test: ${config.name}`);
        console.log(`📧 Email: ${config.email}`);
        console.log(`🔗 URL: ${config.url}`);
        
        const result = await testApiConfig(config);
        
        const testResult = {
          name: config.name,
          description: config.description,
          status: result.success ? 'success' : 'error',
          statusCode: result.status,
          statusText: result.statusText,
          headers: result.headers,
          data: result.data
        };

        if (result.success) {
          console.log('✅ Succès:', result.data);
        } else {
          console.log('❌ Erreur:', result.data);
        }

        setTestResults(prev => [...prev, testResult]);
      } catch (error) {
        const result = {
          name: config.name,
          description: config.description,
          status: 'error',
          statusCode: 0,
          statusText: 'Network Error',
          headers: {},
          data: error instanceof Error ? error.message : 'Erreur inconnue'
        };
        setTestResults(prev => [...prev, result]);
        console.log('❌ Erreur réseau:', error);
      }
    }

    setIsTesting(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Testeur d'API</h2>
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
              onClick={testApiConnection}
              disabled={isTesting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isTesting
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Play className="w-4 h-4" />
              {isTesting ? 'Test en cours...' : 'Lancer les tests'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Résultats des tests</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <span className="font-medium">{result.name}</span>
                      {result.description && (
                        <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.statusCode} {result.statusText}
                    </span>
                  </div>

                  {result.data && (
                    <div className="mt-3">
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium text-gray-600 hover:text-gray-800">
                          Voir les données
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                          {typeof result.data === 'string' 
                            ? result.data 
                            : JSON.stringify(result.data, null, 2)
                          }
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
