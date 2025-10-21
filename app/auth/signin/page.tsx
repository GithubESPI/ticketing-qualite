'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield, Users } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('azure-ad', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Connexion Entreprise
          </CardTitle>
          <CardDescription className="text-gray-600">
            Connectez-vous avec votre compte Microsoft d'entreprise pour accéder au dashboard de gestion qualité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Sécurité Entreprise</p>
                <p className="text-sm text-blue-700">Authentification sécurisée via Azure AD</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Accès Restreint</p>
                <p className="text-sm text-green-700">Réservé aux employés de l'entreprise</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connexion en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Se connecter avec Microsoft
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              En vous connectant, vous acceptez les conditions d'utilisation de l'entreprise.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
