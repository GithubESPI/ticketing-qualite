# Guide de test de l'API Jira

## 🚀 Comment tester l'API avec les vraies données

### 1. **Accès aux outils de test**

L'application dispose de deux outils intégrés pour tester l'API :

#### **Debugger API** (Icône 🐛)
- **Localisation** : Bouton "Bug" dans la barre de navigation
- **Fonction** : Affiche les logs de connexion en temps réel
- **Utilisation** : Cliquez sur le bouton pour activer/désactiver

#### **Testeur API** (Icône 🧪)
- **Localisation** : Bouton "TestTube" dans la barre de navigation
- **Fonction** : Teste différentes configurations d'API
- **Utilisation** : Cliquez pour ouvrir le panneau de test

### 2. **Processus de test**

#### **Étape 1 : Activer le debugger**
1. Cliquez sur l'icône 🐛 dans la barre de navigation
2. Le panneau de debug apparaît en bas à droite
3. Actualisez la page (F5) pour voir les logs de connexion

#### **Étape 2 : Tester les configurations**
1. Cliquez sur l'icône 🧪 pour ouvrir le testeur
2. Cliquez sur "Lancer les tests"
3. Observez les résultats pour chaque configuration

#### **Étape 3 : Analyser les résultats**
- ✅ **Succès** : L'API retourne des données
- ❌ **Erreur** : Problème de connexion ou d'authentification

### 3. **Configurations testées**

L'application teste automatiquement ces configurations :

| Configuration | Email | Description |
|---------------|-------|-------------|
| Configuration actuelle | `informatique@gmail.com` | Credentials fournis |
| Test avec email admin | `admin@alphaservesp.com` | Email administrateur |
| Test avec email support | `support@alphaservesp.com` | Email support |

### 4. **Interprétation des résultats**

#### **Codes de statut courants :**
- **200** : Succès, données récupérées
- **401** : Non autorisé (problème d'authentification)
- **403** : Accès interdit
- **404** : Endpoint non trouvé
- **500** : Erreur serveur

#### **Messages d'erreur courants :**
- **"Email mismatch"** : L'email ne correspond pas au token
- **"Invalid credentials"** : Token invalide ou expiré
- **"Access denied"** : Permissions insuffisantes

### 5. **Structure des données attendues**

L'API devrait retourner des données dans l'un de ces formats :

```json
// Format 1 : OData standard
{
  "value": [
    {
      "id": "TICKET-001",
      "summary": "Titre du ticket",
      "status": "En cours",
      "priority": "Haute",
      "assignee": "Jean Dupont",
      "created": "2025-01-15"
    }
  ]
}

// Format 2 : Format direct
{
  "d": {
    "results": [
      {
        "ticket_id": "TICKET-001",
        "title": "Titre du ticket",
        "state": "En cours",
        "severity": "Haute",
        "owner": "Jean Dupont",
        "date_created": "2025-01-15"
      }
    ]
  }
}
```

### 6. **Mapping automatique**

L'application mappe automatiquement ces champs :

| Champ API | Champ Application | Alternatives |
|-----------|-------------------|--------------|
| `id` | `id` | `key`, `ticket_id` |
| `summary` | `summary` | `title`, `subject` |
| `status` | `status` | `state`, `workflow_state` |
| `priority` | `priority` | `severity` |
| `assignee` | `assignee` | `assigned_to`, `owner`, `user_name` |
| `created` | `created` | `created_date`, `date_created`, `created_at` |

### 7. **Résolution des problèmes**

#### **Problème : "Email mismatch"**
- **Cause** : L'email ne correspond pas au token
- **Solution** : Vérifier que l'email est correct dans la configuration

#### **Problème : "Invalid credentials"**
- **Cause** : Token invalide ou expiré
- **Solution** : Générer un nouveau token d'API

#### **Problème : "Access denied"**
- **Cause** : Permissions insuffisantes
- **Solution** : Vérifier les permissions de l'utilisateur

#### **Problème : "Network Error"**
- **Cause** : Problème de connexion réseau
- **Solution** : Vérifier la connectivité et l'URL de l'API

### 8. **Configuration des variables d'environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_JIRA_TOKEN=votre_token_ici
NEXT_PUBLIC_JIRA_EMAIL=votre_email@exemple.com
NEXT_PUBLIC_JIRA_URL=https://votre-api-jira.com/endpoint
```

### 9. **Logs de débogage**

Les logs de débogage affichent :
- 🔗 URL de l'API utilisée
- 📧 Email utilisé pour l'authentification
- 🔑 Token utilisé (tronqué pour la sécurité)
- 📡 Statut de la réponse HTTP
- 📋 Headers de la réponse
- 📊 Données reçues de l'API
- 🎫 Tickets extraits
- 🔄 Tickets mappés vers le format de l'application

### 10. **Prochaines étapes**

Une fois que l'API fonctionne :
1. Les données réelles remplaceront les données de démonstration
2. Les statistiques se mettront à jour automatiquement
3. Les filtres fonctionneront avec les vraies données
4. L'interface affichera les vrais tickets

---

**Note** : Si l'API ne fonctionne pas, l'application continuera à afficher les données de démonstration pour permettre le développement et les tests.
