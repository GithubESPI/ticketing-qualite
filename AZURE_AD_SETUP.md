# Configuration Azure AD pour l'authentification

Ce guide vous explique comment configurer l'authentification Azure AD pour votre application.

## 1. Configuration dans Azure Portal

### Étape 1 : Créer une App Registration
1. Allez sur [Azure Portal](https://portal.azure.com/)
2. Recherchez "Microsoft Entra ID" et sélectionnez votre organisation
3. Dans le menu de gauche, développez "Manage" puis allez dans "App Registration"
4. Cliquez sur "New registration"

### Étape 2 : Configurer l'application
- **Name** : `Ticketing Qualité Dashboard`
- **Supported account types** : 
  - Sélectionnez "Accounts in this organizational directory only" pour limiter l'accès à votre tenant
- **Redirect URI** : 
  - Platform : Web
  - URI : `http://localhost:3000/api/auth/callback/azure-ad` (pour le développement)
  - URI : `https://votre-domaine.com/api/auth/callback/azure-ad` (pour la production)

### Étape 3 : Récupérer les informations
Après la création de l'application :
1. **Application (client) ID** : Copiez cette valeur
2. **Directory (tenant) ID** : Copiez cette valeur
3. Allez dans "Certificates & secrets" → "Client secrets" → "New client secret"
4. **Client secret** : Copiez la valeur (elle ne sera affichée qu'une fois)

## 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les valeurs suivantes :

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Azure AD Configuration
AZURE_AD_CLIENT_ID=your-application-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
```

### Génération du NEXTAUTH_SECRET
Vous pouvez générer une clé secrète avec :
```bash
openssl rand -base64 32
```

## 3. Configuration des permissions (optionnel)

### API Permissions
Si vous voulez accéder à des données Microsoft Graph :
1. Allez dans "API permissions"
2. Ajoutez les permissions nécessaires (ex: User.Read)
3. Cliquez sur "Grant admin consent"

### User Assignment (optionnel)
Pour limiter l'accès à des utilisateurs spécifiques :
1. Allez dans "Enterprise applications"
2. Trouvez votre application
3. Allez dans "Users and groups"
4. Assignez les utilisateurs autorisés

## 4. Test de l'authentification

1. Démarrez votre application : `npm run dev`
2. Allez sur `http://localhost:3000`
3. Cliquez sur "Se connecter" pour tester l'authentification
4. Vous devriez être redirigé vers Microsoft pour vous connecter

## 5. Déploiement en production

Pour la production :
1. Mettez à jour l'URL de redirection dans Azure Portal
2. Mettez à jour `NEXTAUTH_URL` dans vos variables d'environnement
3. Assurez-vous que votre domaine est configuré correctement

## 6. Sécurité

- Gardez vos secrets sécurisés
- Utilisez HTTPS en production
- Configurez les permissions minimales nécessaires
- Activez l'audit des connexions dans Azure AD

## Dépannage

### Erreurs courantes :
- **AADSTS50011** : URL de redirection incorrecte
- **AADSTS65001** : Permissions manquantes
- **AADSTS90014** : Client secret expiré

### Vérifications :
- Vérifiez que toutes les variables d'environnement sont correctes
- Vérifiez que l'URL de redirection correspond exactement
- Vérifiez que le client secret n'a pas expiré
