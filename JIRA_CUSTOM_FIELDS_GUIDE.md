# 🔍 Guide : Récupérer les Champs Personnalisés Jira

## 🎯 Objectif
Identifier les vraies clés des champs personnalisés dans votre instance Jira pour les intégrer dans le dashboard.

## 📋 Étapes à suivre

### 1️⃣ **Configurer les variables d'environnement**

Créez un fichier `.env.local` avec vos vraies credentials :

```bash
NEXT_PUBLIC_JIRA_BASE_URL=https://groupe-espi.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=votre-email@entreprise.com
NEXT_PUBLIC_JIRA_API_TOKEN=votre-vraie-api-token
```

### 2️⃣ **Lister tous les champs disponibles**

#### 🔍 Méthode 1 : Endpoint classique (limité)
```bash
node get-jira-fields.js
```

#### 🚀 Méthode 2 : Nouvel endpoint (recommandé)
```bash
node get-jira-fields-search.js
```

#### 🎯 Méthode 3 : Champs spécifiques au projet DYS
```bash
node get-dys-project-fields.js
```

**Avantages des nouvelles méthodes :**
- ✅ Utilise l'endpoint `/rest/api/3/field/search` (plus récent)
- ✅ Trouve les champs limités par contexte de projet
- ✅ Recherche par mots-clés (processus, origine, etc.)
- ✅ Filtre par type (custom, standard)
- ✅ Analyse spécifique du projet DYS

### 3️⃣ **Analyser un exemple d'issue**

Exécutez le script pour voir les champs d'un issue réel :

```bash
node get-issue-example.js
```

Ce script va :
- ✅ Récupérer un issue DYS existant
- ✅ Montrer tous les champs personnalisés remplis
- ✅ Générer l'interface TypeScript correcte

## 🔧 **Mise à jour du code**

Une fois les vraies clés identifiées, mettez à jour :

### 1. **Interface TypeScript** (`app/dashboard/page.tsx`)

```typescript
interface JiraIssue {
  // ... champs existants ...
  fields: {
    // ... champs standard ...
    
    // Champs personnalisés réels (remplacer par les vraies clés)
    customfield_10042?: string; // Entité Origine de la réclamation
    customfield_10043?: string; // Processus
    customfield_10044?: string; // Date de la constatation
    customfield_10045?: string; // Origine
    customfield_10046?: string; // Pilotes de processus
    customfield_10047?: string; // Description personnalisée
  };
}
```

### 2. **Headers du tableau**

```typescript
// Remplacer les clés dans les onClick handlers
onClick={() => handleSort('customfield_10042')} // Entité Origine
onClick={() => handleSort('customfield_10043')} // Processus
// etc...
```

### 3. **Cellules du tableau**

```typescript
// Remplacer les clés dans les cellules
{issue.fields.customfield_10042 || 'Non défini'}
{issue.fields.customfield_10043 || 'Non défini'}
// etc...
```

### 4. **Logique de tri**

```typescript
// Ajouter les cas dans le switch du tri
case 'customfield_10042':
  aValue = a.fields.customfield_10042 || '';
  bValue = b.fields.customfield_10042 || '';
  break;
// etc...
```

## 🚀 **Exécution des scripts**

### 📋 **Scripts disponibles**

```bash
# 1. Installer les dépendances
npm install axios dotenv

# 2. Méthode 1 : Endpoint classique (limité)
node get-jira-fields.js

# 3. Méthode 2 : Nouvel endpoint (recommandé)
node get-jira-fields-search.js

# 4. Méthode 3 : Champs spécifiques au projet DYS
node get-dys-project-fields.js

# 5. Test avec credentials directes (sans .env.local)
node test-jira-fields-search.js
node test-dys-project-fields.js
```

### 🔧 **Configuration des credentials**

**Option 1 : Fichier .env.local (recommandé)**
```bash
# Créer le fichier .env.local
NEXT_PUBLIC_JIRA_BASE_URL=https://groupe-espi.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=votre-email@entreprise.com
NEXT_PUBLIC_JIRA_API_TOKEN=votre-vraie-api-token
```

**Option 2 : Scripts de test (sans .env.local)**
- Ouvrez `test-jira-fields-search.js`
- Remplacez `JIRA_API_TOKEN` par votre vraie API token
- Exécutez le script

## 📊 **Résultat attendu**

Après exécution, vous devriez voir :

```
🔹 customfield_10042
   Nom: Entité Origine de la réclamation
   Type: string
   Système: Personnalisé

🔹 customfield_10043
   Nom: Processus
   Type: string
   Système: Personnalisé
```

## ⚠️ **Points importants**

1. **Les clés sont uniques** à votre instance Jira
2. **Les noms peuvent différer** de ce que vous voyez dans l'interface
3. **Certains champs peuvent être vides** dans les issues existants
4. **Les types peuvent varier** (string, number, object, array)

## 🔄 **Mise à jour continue**

Si vous ajoutez de nouveaux champs personnalisés :
1. Relancez `get-jira-fields.js`
2. Identifiez les nouvelles clés
3. Mettez à jour l'interface TypeScript
4. Ajoutez les colonnes dans le tableau
