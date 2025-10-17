'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Settings, Key, Mail, Globe } from 'lucide-react';

interface ConfigurationGuideProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ConfigurationGuide({ isVisible, onClose }: ConfigurationGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const configSteps = [
    {
      id: 'step1',
      title: 'Obtenir une clé API Jira',
      description: 'Générez votre token API sur le site Atlassian',
      icon: Key,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            1. Allez sur <a href="https://id.atlassian.com/manage/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              https://id.atlassian.com/manage/api-tokens <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-sm text-gray-600">2. Cliquez sur "Create API token"</p>
          <p className="text-sm text-gray-600">3. Donnez un nom à votre token</p>
          <p className="text-sm text-gray-600">4. Copiez le token généré</p>
        </div>
      )
    },
    {
      id: 'step2',
      title: 'Créer le fichier .env.local',
      description: 'Configurez vos variables d\'environnement',
      icon: Settings,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-2">Créez un fichier <code className="bg-gray-100 px-2 py-1 rounded text-xs">.env.local</code> à la racine du projet :</p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400"># Configuration API Jira</span>
              <button
                onClick={() => copyToClipboard(`# Configuration API Jira
NEXT_PUBLIC_JIRA_BASE_URL=https://votreentreprise.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=votre-email@exemple.com
NEXT_PUBLIC_JIRA_API_TOKEN=votre-token-api-jira`, 'env')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {copied === 'env' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div>NEXT_PUBLIC_JIRA_BASE_URL=https://votreentreprise.atlassian.net</div>
            <div>NEXT_PUBLIC_JIRA_EMAIL=votre-email@exemple.com</div>
            <div>NEXT_PUBLIC_JIRA_API_TOKEN=votre-token-api-jira</div>
          </div>
        </div>
      )
    },
    {
      id: 'step3',
      title: 'Tester la configuration',
      description: 'Vérifiez que tout fonctionne correctement',
      icon: Globe,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">1. Redémarrez le serveur de développement</p>
          <p className="text-sm text-gray-600">2. Cliquez sur l'icône ⚡ (Testeur API Jira)</p>
          <p className="text-sm text-gray-600">3. Lancez les tests pour vérifier la connexion</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> Si les tests échouent, vérifiez vos credentials et l'URL de votre instance Jira.
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Guide de configuration Jira</h2>
              <p className="text-sm text-gray-600">Configurez votre API Jira en 3 étapes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {configSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{step.title}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Étape {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                    {step.content}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ne commitez jamais le fichier <code>.env.local</code></li>
              <li>• Gardez votre token API secret</li>
              <li>• Régénérez votre token si compromis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
