'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Accès Non Autorisé
          </CardTitle>
          <CardDescription className="text-gray-600">
            Vous devez être connecté avec votre compte Microsoft d'entreprise pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Authentification requise</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Connexion avec compte Microsoft d'entreprise</li>
              <li>• Accès limité aux employés autorisés</li>
              <li>• Session de sécurité active</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Se connecter avec Microsoft
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur système.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
