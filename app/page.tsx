'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Globe,
  Database,
  Settings,
  Bell,
  User,
  Menu,
  X
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Analytics Avancés",
      description: "Tableaux de bord interactifs avec graphiques en temps réel pour suivre les performances de vos projets.",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Gestion d'Équipe",
      description: "Collaboration efficace avec assignation de tâches, suivi des responsabilités et communication centralisée.",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Suivi des Objectifs",
      description: "KPIs personnalisés et métriques de performance pour mesurer l'efficacité de vos processus.",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "Évolution Temporelle",
      description: "Analyse des tendances et évolution des projets dans le temps avec des graphiques dynamiques.",
      color: "bg-orange-50 border-orange-200"
    }
  ];

  const stats = [
    { label: "Projets Actifs", value: "25+", icon: <Database className="w-5 h-5" /> },
    { label: "Issues Résolues", value: "1,200+", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Équipes", value: "8", icon: <Users className="w-5 h-5" /> },
    { label: "Taux de Satisfaction", value: "98%", icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800">Ticketing Qualité</h1>
                <p className="text-sm text-gray-600">Gestion des issues et suivi qualité</p>
              </div>
            </div>
            
            {/* Navigation principale */}
            <div className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                <Target className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/analytics')}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/auth/signin')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Star className="w-4 h-4" />
              Plateforme de Gestion Qualité
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Ticketing Qualité
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Solution complète de gestion des issues et suivi qualité pour optimiser vos processus 
              et améliorer la performance de vos équipes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                Accéder au Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/analytics')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
              >
                Voir les Analytics
                <BarChart3 className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les outils puissants qui transforment votre gestion de la qualité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`${feature.color} border-2 hover:shadow-lg transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    {feature.icon}
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">
              Prêt à Optimiser Votre Gestion Qualité ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'équipes qui font confiance à notre plateforme 
              pour améliorer leurs processus et leurs performances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/dashboard')}
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg"
              >
                Commencer Maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/analytics')}
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                Explorer les Analytics
                <BarChart3 className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
      </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ticketing Qualité</h3>
                  <p className="text-sm text-gray-400">Dashboard DYS</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Solution complète de gestion des issues et suivi qualité pour optimiser vos processus.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => router.push('/dashboard')} className="hover:text-white transition-colors">Dashboard</button></li>
                <li><button onClick={() => router.push('/analytics')} className="hover:text-white transition-colors">Analytics</button></li>
                <li><button className="hover:text-white transition-colors">Projets</button></li>
                <li><button className="hover:text-white transition-colors">Équipes</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition-colors">Gestion des Issues</button></li>
                <li><button className="hover:text-white transition-colors">Analytics Avancés</button></li>
                <li><button className="hover:text-white transition-colors">Rapports</button></li>
                <li><button className="hover:text-white transition-colors">Intégrations</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition-colors">Documentation</button></li>
                <li><button className="hover:text-white transition-colors">Aide</button></li>
                <li><button className="hover:text-white transition-colors">Contact</button></li>
                <li><button className="hover:text-white transition-colors">Statut</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Ticketing Qualité. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Système opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}