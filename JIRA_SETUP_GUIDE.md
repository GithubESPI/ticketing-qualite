# Guide de configuration de l'API Jira

## 🚀 Configuration de l'API Jira officielle

### 1. **Prérequis**

Avant de configurer l'API Jira, vous devez avoir :

✅ **Un compte Jira** (Cloud ou Server)  
✅ **L'URL de votre instance Jira**  
✅ **Une clé API Jira** (pour Jira Cloud)  
✅ **Votre adresse e-mail Atlassian**

### 2. **Obtenir une clé API Jira**

1. **Connectez-vous** à votre compte Atlassian : https://id.atlassian.com
2. **Allez dans** "API tokens" : https://id.atlassian.com/manage/api-tokens
3. **Cliquez sur** "Create API token"
4. **Donnez un nom** à votre token (ex: "Tableau de bord tickets")
5. **Copiez le token** généré (vous ne pourrez plus le voir après)

### 3. **Configuration des variables d'environnement**

Créez un fichier `.env.local` à la racine de votre projet :

```env
# Configuration API Jira officielle
NEXT_PUBLIC_JIRA_BASE_URL=https://votreentreprise.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=votre-email@exemple.com
NEXT_PUBLIC_JIRA_API_TOKEN=votre-token-api-jira
```

### 4. **Exemples de configuration**

#### **Pour Jira Cloud :**
```env
NEXT_PUBLIC_JIRA_BASE_URL=https://monentreprise.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=jean.dupont@monentreprise.com
NEXT_PUBLIC_JIRA_API_TOKEN=ATATT3xFfGF0...
```

#### **Pour Jira Server :**
```env
NEXT_PUBLIC_JIRA_BASE_URL=https://jira.monentreprise.com
NEXT_PUBLIC_JIRA_EMAIL=jean.dupont@monentreprise.com
NEXT_PUBLIC_JIRA_API_TOKEN=votre-token-personnalise
```

### 5. **Test de la configuration**

Une fois configuré, vous pouvez tester votre configuration :

1. **Ouvrez l'application** : `http://localhost:3000`
2. **Cliquez sur l'icône ⚡** (Testeur API Jira)
3. **Lancez les tests** pour vérifier la connexion

### 6. **Endpoints testés**

Le testeur vérifie automatiquement :

- ✅ **Connexion à Jira** : Test de base de l'API
- ✅ **Informations utilisateur** : Récupération de votre profil
- ✅ **Liste des projets** : Récupération des projets accessibles
- ✅ **Recherche d'issues** : Test de recherche avec JQL

### 7. **Structure des données**

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

### 8. **Mapping automatique**

L'application mappe automatiquement les champs Jira :

| Champ Jira | Champ Application | Description |
|------------|-------------------|-------------|
| `key` | `id` | Clé du ticket (ex: PROJ-123) |
| `fields.summary` | `summary` | Titre du ticket |
| `fields.status.name` | `status` | Statut du ticket |
| `fields.priority.name` | `priority` | Priorité du ticket |
| `fields.assignee.displayName` | `assignee` | Personne assignée |
| `fields.created` | `created` | Date de création |

### 9. **Résolution des problèmes**

#### **Erreur : "401 Unauthorized"**
- **Cause** : Email ou token incorrect
- **Solution** : Vérifiez vos credentials dans `.env.local`

#### **Erreur : "403 Forbidden"**
- **Cause** : Permissions insuffisantes
- **Solution** : Vérifiez que votre compte a accès aux projets

#### **Erreur : "404 Not Found"**
- **Cause** : URL de base incorrecte
- **Solution** : Vérifiez `NEXT_PUBLIC_JIRA_BASE_URL`

#### **Erreur : "Network Error"**
- **Cause** : Problème de connectivité
- **Solution** : Vérifiez votre connexion internet et l'URL

### 10. **Sécurité**

⚠️ **Important** :
- Ne commitez **jamais** le fichier `.env.local`
- Gardez votre token API **secret**
- Régénérez votre token si compromis
- Utilisez des tokens avec des permissions minimales

### 11. **Permissions requises**

Votre compte Jira doit avoir les permissions suivantes :
- **Lire les projets** : Pour lister les projets
- **Lire les issues** : Pour récupérer les tickets
- **Rechercher** : Pour utiliser l'API de recherche

### 12. **Limites de l'API**

- **Rate limiting** : 100 requêtes/minute par défaut
- **Taille des réponses** : Maximum 1000 issues par requête
- **Champs** : Seuls les champs demandés sont retournés

---

**Note** : Si l'API Jira ne fonctionne pas, l'application continuera à afficher les données de démonstration pour permettre le développement.
