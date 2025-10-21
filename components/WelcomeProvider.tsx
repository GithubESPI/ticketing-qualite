'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WelcomeScreen from './WelcomeScreen';

export default function WelcomeProvider({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu la page de bienvenue
    const hasSeenWelcomeBefore = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcomeBefore && pathname === '/') {
      setShowWelcome(true);
    } else {
      setHasSeenWelcome(true);
    }
  }, [pathname]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
    setHasSeenWelcome(true);
  };

  // Afficher la page de bienvenue seulement sur la page d'accueil et si pas encore vue
  if (showWelcome && pathname === '/') {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return <>{children}</>;
}
