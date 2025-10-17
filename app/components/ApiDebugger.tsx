'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, AlertCircle, CheckCircle } from 'lucide-react';

interface ApiDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function ApiDebugger({ isVisible, onToggle }: ApiDebuggerProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Intercepter les console.log pour afficher les logs de l'API
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      if (args[0]?.includes?.('🔗') || args[0]?.includes?.('📧') || args[0]?.includes?.('🔑') || 
          args[0]?.includes?.('📡') || args[0]?.includes?.('📋') || args[0]?.includes?.('📊') || 
          args[0]?.includes?.('🎫') || args[0]?.includes?.('🔄') || args[0]?.includes?.('❌')) {
        setLogs(prev => [...prev.slice(-9), args.join(' ')]);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      if (args[0]?.includes?.('❌')) {
        setLogs(prev => [...prev.slice(-9), `❌ ${args.join(' ')}`]);
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Debug API</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLogs}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Copier les logs"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 max-h-60 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">En attente des logs de l'API...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${
                  log.includes('❌') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : log.includes('✅') || log.includes('📊')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <pre className="whitespace-pre-wrap font-mono">{log}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Monitoring en temps réel</span>
        </div>
      </div>
    </div>
  );
}
