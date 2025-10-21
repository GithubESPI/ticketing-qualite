'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-100 to-yellow-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Erreur de Connexion
          </CardTitle>
          <CardDescription className="text-gray-600">
            Une erreur s'est produite lors de votre tentative de connexion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Causes possibles :</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Vous n'avez pas les permissions d'accès</li>
              <li>• Votre compte n'est pas autorisé</li>
              <li>• Problème de configuration Azure AD</li>
              <li>• Session expirée</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer la connexion
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
              Si le problème persiste, contactez votre administrateur système.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
