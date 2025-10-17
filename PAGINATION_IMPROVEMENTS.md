# 📄 Système de pagination pour le tableau

## 🎯 Objectif
Ajouter une pagination complète pour éviter de trop scroller et limiter la taille du tableau.

## ✅ Améliorations apportées

### 1. **État de pagination**
- ✅ **currentPage** : Page actuelle (défaut: 1)
- ✅ **itemsPerPage** : Nombre d'éléments par page (défaut: 10)
- ✅ **Gestion des états** : Reset automatique à la page 1 lors des changements

### 2. **Fonctions de pagination**
- ✅ **getPaginatedIssues()** : Récupère les issues de la page actuelle
- ✅ **getTotalPages()** : Calcule le nombre total de pages
- ✅ **handlePageChange()** : Change de page
- ✅ **handleItemsPerPageChange()** : Change le nombre d'éléments par page

### 3. **Interface utilisateur**
- ✅ **Sélecteur d'éléments par page** : 5, 10, 20, 50 options
- ✅ **Compteur d'issues** : Affichage de la page actuelle et du total
- ✅ **Boutons de navigation** : Précédent/Suivant avec états désactivés
- ✅ **Numéros de page** : Affichage intelligent (max 5 pages visibles)

### 4. **Contraintes de taille**
- ✅ **Hauteur maximale** : `max-h-[600px]` pour le tableau
- ✅ **Scroll vertical** : `overflow-y-auto` quand nécessaire
- ✅ **Scroll horizontal** : `overflow-x-auto` pour les colonnes

### 5. **Recherche améliorée**
- ✅ **Recherche dans les descriptions** : Inclusion du contenu des descriptions
- ✅ **Filtrage intelligent** : Maintien des filtres lors de la pagination
- ✅ **Reset de pagination** : Retour à la page 1 lors des nouveaux filtres

## 🎨 Design et UX

### Composant de pagination
```typescript
<div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
  <div className="flex items-center justify-between">
    <div className="text-sm text-gray-600">
      Affichage de {start} à {end} sur {total} issues
    </div>
    
    <div className="flex items-center gap-2">
      {/* Boutons de navigation */}
      <Button onClick={() => handlePageChange(currentPage - 1)}>
        Précédent
      </Button>
      
      {/* Numéros de page */}
      {pageNumbers.map(page => (
        <Button key={page} onClick={() => handlePageChange(page)}>
          {page}
        </Button>
      ))}
      
      <Button onClick={() => handlePageChange(currentPage + 1)}>
        Suivant
      </Button>
    </div>
  </div>
</div>
```

### Sélecteur d'éléments par page
```typescript
<Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
  <SelectTrigger>
    <SelectValue placeholder="Éléments par page" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="5">5 par page</SelectItem>
    <SelectItem value="10">10 par page</SelectItem>
    <SelectItem value="20">20 par page</SelectItem>
    <SelectItem value="50">50 par page</SelectItem>
  </SelectContent>
</Select>
```

## 🔧 Fonctionnalités techniques

### Logique de pagination
```typescript
const getPaginatedIssues = () => {
  const filtered = getFilteredAndSortedIssues();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filtered.slice(startIndex, endIndex);
};

const getTotalPages = () => {
  const filtered = getFilteredAndSortedIssues();
  return Math.ceil(filtered.length / itemsPerPage);
};
```

### Gestion des états
```typescript
const handleItemsPerPageChange = (newItemsPerPage: number) => {
  setState(prev => ({ 
    ...prev, 
    itemsPerPage: newItemsPerPage, 
    currentPage: 1 // Reset to first page
  }));
};
```

### Recherche étendue
```typescript
const matchesSearch = issue.fields.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (issue.fields.description && 
                      issue.fields.description.toLowerCase().includes(searchTerm.toLowerCase()));
```

## 📊 Options de pagination

### Nombre d'éléments par page
- **5 par page** : Pour un affichage compact
- **10 par page** : Par défaut, équilibré
- **20 par page** : Pour plus de données visibles
- **50 par page** : Pour une vue d'ensemble

### Calcul automatique
- **Pages totales** : `Math.ceil(totalIssues / itemsPerPage)`
- **Index de début** : `(currentPage - 1) * itemsPerPage`
- **Index de fin** : `startIndex + itemsPerPage`

## 🎨 Interface utilisateur

### Compteur d'issues
```
Affichage de 1 à 10 sur 59 issues (page 1/6)
```

### Navigation
- **Bouton Précédent** : Désactivé sur la première page
- **Bouton Suivant** : Désactivé sur la dernière page
- **Numéros de page** : Affichage intelligent (max 5 visibles)
- **Page actuelle** : Mise en surbrillance

### Responsive design
- **Mobile** : Navigation simplifiée
- **Desktop** : Affichage complet avec numéros
- **Tablet** : Adaptation automatique

## 🚀 Utilisation

### Navigation
1. **Changer de page** : Cliquez sur les numéros ou Précédent/Suivant
2. **Changer le nombre d'éléments** : Utilisez le sélecteur
3. **Rechercher** : La pagination se réinitialise automatiquement
4. **Filtrer** : Les filtres maintiennent la pagination

### Contraintes
- **Hauteur maximale** : 600px pour le tableau
- **Scroll automatique** : Quand le contenu dépasse
- **Performance** : Seules les données de la page actuelle sont affichées

## 📈 Résultats

### Avant la pagination
- ❌ Tous les issues affichés (59+ éléments)
- ❌ Scroll excessif
- ❌ Performance dégradée
- ❌ Interface surchargée

### Après la pagination
- ✅ Affichage limité (10 par page par défaut)
- ✅ Navigation fluide
- ✅ Performance optimisée
- ✅ Interface claire et organisée
- ✅ Recherche dans les descriptions
- ✅ Filtres maintenus
- ✅ Hauteur contrôlée

## 🔄 Prochaines étapes possibles

1. **Sauvegarde des préférences** : Mémoriser le nombre d'éléments par page
2. **Navigation au clavier** : Raccourcis clavier pour la pagination
3. **Export paginé** : Export des données de la page actuelle
4. **Pagination serveur** : Pagination côté API pour de gros volumes
5. **Filtres avancés** : Filtres par date, statut, etc. avec pagination
6. **Tri persistant** : Maintien du tri lors de la pagination
