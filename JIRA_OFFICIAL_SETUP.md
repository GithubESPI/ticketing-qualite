# Configuration de l'API Jira officielle

## 🎯 **Objectif**

Configurer l'application pour utiliser l'**API Jira officielle** au lieu de l'API PowerBI, selon la [documentation Atlassian](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#authentication).

## 🔑 **Étape 1 : Générer un token API Jira**

### **1.1 Accéder au portail Atlassian**
1. Allez sur : https://id.atlassian.com/manage/api-tokens
2. Connectez-vous avec votre compte Atlassian (`informatique@groupe-espi.fr`)

### **1.2 Créer un nouveau token**
1. Cliquez sur **"Create API token"**
2. Donnez un nom descriptif : `"Tableau de bord tickets"`
3. Cliquez sur **"Create"**
4. **Copiez le token généré** (vous ne pourrez plus le voir après)

### **1.3 Important**
- ⚠️ **Gardez ce token secret**
- ⚠️ **Ne le partagez jamais**
- ⚠️ **Régénérez-le si compromis**

## 🔧 **Étape 2 : Configurer les variables d'environnement**

### **2.1 Créer le fichier .env.local**
Créez un fichier `.env.local` à la racine de votre projet :

```env
# Configuration API Jira officielle
NEXT_PUBLIC_JIRA_BASE_URL=https://groupe-espi.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=informatique@groupe-espi.fr
NEXT_PUBLIC_JIRA_API_TOKEN=votre-nouveau-token-api-jira-ici
```

### **2.2 Remplacer les valeurs**
- `votre-nouveau-token-api-jira-ici` → Votre vrai token API Jira généré

## 🧪 **Étape 3 : Tester la configuration**

### **3.1 Test avec le script**
```bash
node test-jira-official.js
```

### **3.2 Test avec l'application**
1. Lancez l'application : `npm run dev`
2. Cliquez sur l'icône ⚡ (Testeur API Jira)
3. Lancez les tests pour vérifier la connexion

## 📊 **Endpoints testés**

L'application testera automatiquement :

| Endpoint | Description | URL |
|----------|-------------|-----|
| **Myself** | Informations utilisateur | `/rest/api/3/myself` |
| **Projects** | Liste des projets | `/rest/api/3/project` |
| **Search** | Recherche d'issues | `/rest/api/3/search` |

## 🔍 **Structure des données Jira**

L'API Jira retourne des données dans ce format :

```json
{
  "expand": "schema,names",
  "startAt": 0,
  "maxResults": 50,
  "total": 100,
  "issues": [
    {
      "id": "10001",
      "key": "PROJ-123",
      "fields": {
        "summary": "Titre du ticket",
        "status": {
          "name": "En cours"
        },
        "priority": {
          "name": "Haute"
        },
        "assignee": {
          "displayName": "Jean Dupont"
        },
        "created": "2025-01-15T10:30:00.000+0000"
      }
    }
  ]
}
```

## 🗺️ **Mapping automatique**

L'application mappe automatiquement :

| Champ Jira | Champ Application | Description |
|------------|-------------------|-------------|
| `key` | `id` | Clé du ticket (ex: PROJ-123) |
| `fields.summary` | `summary` | Titre du ticket |
| `fields.status.name` | `status` | Statut du ticket |
| `fields.priority.name` | `priority` | Priorité du ticket |
| `fields.assignee.displayName` | `assignee` | Personne assignée |
| `fields.created` | `created` | Date de création |

## 🚀 **Avantages de l'API Jira officielle**

### **✅ Fonctionnalités complètes**
- Recherche avancée avec JQL
- Tous les champs des issues
- Métadonnées complètes
- Pagination native

### **✅ Performance optimisée**
- Rate limiting intelligent
- Cache automatique
- Compression des réponses
- Mise en cache côté serveur

### **✅ Sécurité renforcée**
- Authentification Basic sécurisée
- Tokens API avec expiration
- Permissions granulaires
- Audit des accès

## 🔧 **Configuration de l'application**

Une fois le token configuré, l'application :

1. **Détecte automatiquement** le token API Jira
2. **Utilise l'API officielle** au lieu de PowerBI
3. **Mappe les données** vers le format de l'application
4. **Affiche les vraies données** des tickets

## 🆘 **Résolution des problèmes**

### **Erreur 401 Unauthorized**
- ✅ Vérifiez votre email Atlassian
- ✅ Vérifiez que le token est correct
- ✅ Régénérez le token si nécessaire

### **Erreur 403 Forbidden**
- ✅ Vérifiez vos permissions Jira
- ✅ Contactez l'administrateur Jira
- ✅ Vérifiez l'accès aux projets

### **Erreur 404 Not Found**
- ✅ Vérifiez l'URL de base
- ✅ Vérifiez que l'instance Jira est accessible
- ✅ Testez l'URL dans le navigateur

## 📈 **Prochaines étapes**

Une fois configuré :

1. **L'application récupère** les vraies données Jira
2. **Les statistiques** se mettent à jour automatiquement
3. **Les filtres** fonctionnent avec les vraies données
4. **L'interface** affiche les vrais tickets

---

**Note** : Si l'API Jira ne fonctionne pas, l'application continuera à utiliser les données de démonstration pour permettre le développement.
