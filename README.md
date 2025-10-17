# Tableau de bord Jira - Système de gestion des tickets

Un tableau de bord moderne et interactif pour la gestion des tickets Jira, développé avec Next.js 15 et TypeScript.

## 🚀 Fonctionnalités

- **Interface moderne** : Design responsive avec animations fluides
- **Gestion des tickets** : Affichage, filtrage et suivi des tickets
- **Statistiques en temps réel** : Tableaux de bord avec métriques
- **Filtres avancés** : Filtrage par statut, priorité, assigné
- **API intégrée** : Connexion à l'API Jira avec fallback sur données de démonstration
- **Composants modulaires** : Architecture composant réutilisable
- **Variables d'environnement** : Configuration sécurisée

## 🏗️ Architecture

### Structure des composants

```
app/
├── components/           # Composants réutilisables
│   ├── LoadingSpinner.tsx
│   ├── ErrorAlert.tsx
│   ├── StatsCards.tsx
│   ├── FilterButtons.tsx
│   ├── TicketCard.tsx
│   └── EmptyState.tsx
├── hooks/               # Hooks personnalisés
│   └── useTickets.ts
├── config/              # Configuration
│   └── env.ts
└── page.tsx             # Page principale
```

### Hooks personnalisés

- **`useTickets`** : Gestion des données des tickets, API calls, états de chargement

### Composants

- **`LoadingSpinner`** : Indicateur de chargement animé
- **`ErrorAlert`** : Affichage des erreurs avec possibilité de fermeture
- **`StatsCards`** : Cartes de statistiques avec animations
- **`FilterButtons`** : Boutons de filtrage interactifs
- **`TicketCard`** : Carte individuelle de ticket avec actions
- **`EmptyState`** : État vide avec suggestions d'actions

## 🛠️ Installation et configuration

### 1. Installation des dépendances

```bash
npm install
# ou
yarn install
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration API Jira
NEXT_PUBLIC_JIRA_TOKEN=votre_token_ici
NEXT_PUBLIC_JIRA_EMAIL=votre_email@exemple.com
NEXT_PUBLIC_JIRA_URL=https://votre-api-jira.com/endpoint
```

### 3. Lancement du serveur de développement

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎨 Design et UX

### Couleurs et thème

- **Palette principale** : Bleu (#3B82F6) et Violet (#8B5CF6)
- **Gradients** : Dégradés modernes pour les cartes et boutons
- **Animations** : Transitions fluides et micro-interactions
- **Responsive** : Design adaptatif pour tous les écrans

### Animations

- **Entrée** : Animation slide-in depuis le bas
- **Hover** : Effets de survol avec scale et shadow
- **Loading** : Spinners animés avec effets de profondeur
- **Transitions** : Transitions CSS fluides

## 🔧 Configuration avancée

### Variables d'environnement

Le système utilise des variables d'environnement pour la configuration de l'API :

```typescript
// app/config/env.ts
export const config = {
  jira: {
    token: process.env.NEXT_PUBLIC_JIRA_TOKEN,
    email: process.env.NEXT_PUBLIC_JIRA_EMAIL,
    url: process.env.NEXT_PUBLIC_JIRA_URL
  }
};
```

### Personnalisation des couleurs

Modifiez les couleurs dans `app/globals.css` :

```css
/* Gradients personnalisés */
.gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 📱 Responsive Design

- **Mobile** : Layout en colonne unique
- **Tablet** : Grille 2 colonnes pour les statistiques
- **Desktop** : Grille 4 colonnes avec sidebar

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm run build
vercel --prod
```

### Variables d'environnement en production

Assurez-vous de configurer les variables d'environnement dans votre plateforme de déploiement :

- `NEXT_PUBLIC_JIRA_TOKEN`
- `NEXT_PUBLIC_JIRA_EMAIL`
- `NEXT_PUBLIC_JIRA_URL`

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

1. Vérifiez la configuration des variables d'environnement
2. Consultez les logs de la console
3. Assurez-vous que l'API Jira est accessible
4. Créez une issue sur GitHub

---

Développé avec ❤️ en utilisant Next.js 15, TypeScript et Tailwind CSS.
