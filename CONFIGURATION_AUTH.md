# Configuration de l'authentification - URGENT

## Erreur détectée
L'erreur `[next-auth][error][NO_SECRET]` indique que la variable `NEXTAUTH_SECRET` n'est pas configurée.

## Solution immédiate

### 1. Créer le fichier `.env.local`
Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tTfGes4KIYNyZ39jNsdYzoU6piFPaGfFvF3DCzLn7ao=

# Azure AD Configuration (à remplacer par vos vraies valeurs)
AZURE_AD_CLIENT_ID=your-application-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Jira API Configuration (existing)
JIRA_API_TOKEN=ATATT3xFfGF0AeP-5M5osuStFwtYJSqGchIj_1-bZTXUD3v6snygwKdvcW8_pD4OLrbR9pgR5c3fqMUNbThxo1ny1Acy0q-aelbBqzMGe5oxPTHTTV6yOfLVi0PyNcF3aAKImYuhZfrPtJ4gMm-avRuM8ty31w-oJM-_-olVevu6nlAJ9uMIN_4=4AE0F848
JIRA_EMAIL=informatique@groupe-espi.fr
```

### 2. Configurer Azure AD
Pour que l'authentification fonctionne, vous devez :

1. **Aller sur Azure Portal** : https://portal.azure.com/
2. **Créer une App Registration** :
   - Nom : "Ticketing Qualité Dashboard"
   - Type de compte : "Comptes dans ce répertoire d'organisation uniquement"
   - URI de redirection : `http://localhost:3000/api/auth/callback/azure-ad`

3. **Récupérer les identifiants** :
   - Application (client) ID
   - Directory (tenant) ID  
   - Client secret (dans "Certificates & secrets")

4. **Remplacer dans `.env.local`** :
   - `AZURE_AD_CLIENT_ID` par votre Application ID
   - `AZURE_AD_CLIENT_SECRET` par votre Client Secret
   - `AZURE_AD_TENANT_ID` par votre Tenant ID

### 3. Redémarrer l'application
```bash
npm run dev
```

## Test
1. Allez sur `http://localhost:3000`
2. Cliquez sur "Se connecter"
3. Vous devriez être redirigé vers Microsoft pour vous connecter

## Guide complet
Voir le fichier `AZURE_AD_SETUP.md` pour un guide détaillé de configuration Azure AD.
