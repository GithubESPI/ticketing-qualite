'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Target, TrendingUp, CheckCircle, Zap, Star } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete?: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const steps = [
    {
      icon: <BarChart3 className="w-16 h-16 text-blue-600" />,
      title: "Ticketing Qualité",
      subtitle: "Bienvenue dans votre espace de gestion",
      description: "Solution complète pour optimiser vos processus qualité"
    },
    {
      icon: <Target className="w-16 h-16 text-green-600" />,
      title: "Suivi en Temps Réel",
      subtitle: "Dashboard interactif",
      description: "Visualisez vos métriques et KPIs en temps réel"
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-purple-600" />,
      title: "Analytics Avancés",
      subtitle: "Insights intelligents",
      description: "Analysez vos données avec des graphiques dynamiques"
    },
    {
      icon: <CheckCircle className="w-16 h-16 text-emerald-600" />,
      title: "Prêt à Commencer",
      subtitle: "Tout est configuré",
      description: "Accédez à votre tableau de bord personnalisé"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          // Délai avant la redirection
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              if (onComplete) {
                onComplete();
              } else {
                router.push('/');
              }
            }, 500);
          }, 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [router]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center z-50">
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Logo animé */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-2xl">
              {steps[currentStep].icon}
            </div>
          </div>
        </div>

        {/* Contenu textuel avec animations */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
            {steps[currentStep].title}
          </h1>
          
          <h2 className="text-xl md:text-2xl text-gray-700 font-medium animate-slide-up">
            {steps[currentStep].subtitle}
          </h2>
          
          <p className="text-lg text-gray-600 animate-slide-up-delay">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Barre de progression */}
        <div className="mt-12">
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index <= currentStep 
                    ? 'bg-blue-600 scale-125' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Indicateur de chargement */}
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delay {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}
