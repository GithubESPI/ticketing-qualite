# Guide de Sécurité - Protection des Routes

## 🔒 Routes Protégées

Les routes suivantes sont maintenant protégées et nécessitent une authentification :

### Pages Protégées
- `/dashboard` - Tableau de bord principal
- `/dashboard/*` - Toutes les sous-pages du dashboard
- `/analytics` - Page d'analytics
- `/analytics/*` - Toutes les sous-pages d'analytics

### API Routes Protégées
- `/api/powerbi/issues` - API pour récupérer les issues Jira

## 🛡️ Mécanismes de Protection

### 1. Middleware NextAuth
- **Fichier** : `middleware.ts`
- **Fonction** : Intercepte les requêtes vers les routes protégées
- **Action** : Redirige vers `/auth/signin` si non authentifié
- **Logs** : Console logs pour le debugging

### 2. Composant AuthGuard
- **Fichier** : `components/AuthGuard.tsx`
- **Fonction** : Wrapper pour les composants protégés
- **États** :
  - `loading` : Affichage de chargement
  - `unauthenticated` : Redirection vers la connexion
  - `authenticated` : Affichage du contenu

### 3. Protection API
- **Fichier** : `lib/auth-utils.ts`
- **Fonction** : Utilitaires pour vérifier l'authentification
- **Méthodes** :
  - `isAuthenticated()` : Vérifie si l'utilisateur est connecté
  - `getAuthenticatedUser()` : Récupère les données utilisateur

## 🔄 Flux d'Authentification

### 1. Accès Non Authentifié
```
Utilisateur → Route Protégée → Middleware → /auth/signin
```

### 2. Authentification en Cours
```
Utilisateur → AuthGuard → Écran de Chargement
```

### 3. Authentification Réussie
```
Utilisateur → AuthGuard → Contenu Protégé
```

## 🚨 Gestion des Erreurs

### Pages d'Erreur
- `/auth/signin` - Page de connexion
- `/auth/error` - Erreurs d'authentification
- `/unauthorized` - Accès refusé

### Codes d'Erreur API
- `401` - Non autorisé (authentification requise)
- `403` - Interdit (permissions insuffisantes)

## 🔧 Configuration

### Variables d'Environnement Requises
```env
NEXTAUTH_SECRET=your-secret-key
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
```

### Middleware Configuration
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analytics/:path*',
    '/api/protected/:path*'
  ]
};
```

## 🧪 Tests de Sécurité

### Scénarios à Tester
1. **Accès direct sans authentification**
   - Aller sur `/dashboard` sans être connecté
   - Vérifier la redirection vers `/auth/signin`

2. **Session expirée**
   - Se connecter puis laisser la session expirer
   - Essayer d'accéder à une route protégée
   - Vérifier la redirection

3. **API sans authentification**
   - Appeler `/api/powerbi/issues` sans token
   - Vérifier la réponse 401

4. **Navigation entre pages protégées**
   - Se connecter et naviguer entre dashboard et analytics
   - Vérifier que l'accès est fluide

## 🔍 Debugging

### Logs du Middleware
```bash
🔒 Middleware: Protecting route /dashboard
🔍 Middleware: Checking authorization for /dashboard
🔑 Token exists: true
✅ Token found, access granted
```

### Logs d'Authentification
```bash
Session user: { name: "John Doe", email: "john@company.com" }
User image: "https://..."
```

## 🚀 Déploiement

### Production
1. **Variables d'environnement** : Configurer les vraies valeurs Azure AD
2. **HTTPS** : S'assurer que l'application utilise HTTPS
3. **Domaines** : Configurer les URLs de redirection Azure AD
4. **Monitoring** : Surveiller les tentatives d'accès non autorisées

### Sécurité Renforcée
- **Rate Limiting** : Limiter les tentatives de connexion
- **Audit Logs** : Enregistrer les accès et tentatives
- **Session Timeout** : Configurer l'expiration des sessions
- **IP Whitelisting** : Limiter l'accès par IP si nécessaire

## 📋 Checklist de Sécurité

- [ ] Routes protégées configurées
- [ ] Middleware actif
- [ ] AuthGuard implémenté
- [ ] API routes sécurisées
- [ ] Variables d'environnement configurées
- [ ] Tests de sécurité effectués
- [ ] Monitoring en place
- [ ] Documentation à jour
