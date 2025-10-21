# Guide Analytics - Analyse par Processus

## 🎯 Nouvelles Fonctionnalités

### 1. **Filtre par Processus**
- **Localisation** : Sidebar de la page Analytics
- **Fonction** : Filtrer les issues par processus spécifique
- **Source** : Champ personnalisé `customfield_10008` (Processus)
- **Options** : Tous les processus + processus individuels

### 2. **Graphique en Barres - Issues par Processus**
- **Type** : BarChart
- **Données** : Nombre d'issues par processus
- **Couleurs** : Palette automatique avec couleurs distinctes
- **Interactivité** : Tooltips au survol

### 3. **Graphique en Camembert - Issues par Processus**
- **Type** : PieChart
- **Données** : Distribution des issues par processus
- **Labels** : Affichage du nom du processus et du nombre
- **Couleurs** : Cohérentes avec le graphique en barres

## 📊 Structure des Données

### Interface AnalyticsState
```typescript
interface AnalyticsState {
  // ... autres propriétés
  processusFilter: string; // Nouveau filtre ajouté
}
```

### Fonction getIssuesByProcessus()
```typescript
const getIssuesByProcessus = () => {
  const processusCounts = filteredIssues.reduce((acc, issue) => {
    const processus = issue.fields.customfield_10008 || 'Non défini';
    acc[processus] = (acc[processus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Données d'exemple si pas de données réelles
  if (Object.keys(processusCounts).length === 0) {
    return [
      { processus: 'Processus A', count: 12, fill: COLORS[0] },
      { processus: 'Processus B', count: 8, fill: COLORS[1] },
      // ...
    ];
  }
  
  return Object.entries(processusCounts).map(([processus, count], index) => ({
    processus,
    count,
    fill: COLORS[index % COLORS.length]
  }));
};
```

## 🔧 Configuration

### Filtre dans la Sidebar
```tsx
{/* Filtre par processus */}
<div>
  <label className="text-sm font-medium text-gray-700 mb-2 block">Processus</label>
  <Select value={state.processusFilter} onValueChange={(value) => setState(prev => ({ ...prev, processusFilter: value }))}>
    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
      <SelectValue placeholder="Tous les processus" />
    </SelectTrigger>
    <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
      <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les processus</SelectItem>
      {Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10008).filter(Boolean))).map(processus => (
        <SelectItem key={processus || ''} value={processus || ''} className="text-gray-900 hover:bg-blue-50">{processus || ''}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Graphique en Barres
```tsx
<Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-gray-900">
      <Activity className="w-5 h-5 text-purple-600" />
      Issues par Processus
    </CardTitle>
    <CardDescription className="text-gray-600">Répartition des issues par processus</CardDescription>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart data={getIssuesByProcessus()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="processus" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  </CardContent>
</Card>
```

### Graphique en Camembert
```tsx
<Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-gray-900">
      <Activity className="w-5 h-5 text-purple-600" />
      Issues par Processus
    </CardTitle>
    <CardDescription className="text-gray-600">Distribution des issues par processus</CardDescription>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig} className="h-[300px]">
      <PieChart>
        <Pie
          data={getIssuesByProcessus()}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="count"
          label={({ processus, count }) => `${processus}: ${count}`}
        >
          {getIssuesByProcessus().map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  </CardContent>
</Card>
```

## 🎨 Design et UX

### Couleurs et Icônes
- **Icône** : `Activity` (purple-600)
- **Couleurs** : Palette automatique avec couleurs distinctes
- **Style** : Cohérent avec les autres graphiques

### Responsive Design
- **Mobile** : Graphiques adaptatifs
- **Desktop** : Affichage optimal
- **Tablet** : Mise en page fluide

## 📈 Utilisation

### 1. **Filtrage par Processus**
- Sélectionner un processus dans la sidebar
- Les graphiques se mettent à jour automatiquement
- Tous les KPIs sont recalculés

### 2. **Analyse Visuelle**
- **Barres** : Comparaison quantitative entre processus
- **Camembert** : Répartition proportionnelle
- **Tooltips** : Détails au survol

### 3. **Données d'Exemple**
- Si pas de données réelles, affichage de données d'exemple
- Permet de tester l'interface
- Données réalistes pour la démonstration

## 🔍 Debugging

### Vérification des Données
```typescript
// Debug dans la console
console.log('Processus disponibles:', Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10008).filter(Boolean))));
console.log('Données processus:', getIssuesByProcessus());
```

### Problèmes Courants
1. **Pas de données** : Vérifier que `customfield_10008` est bien rempli
2. **Filtre ne fonctionne pas** : Vérifier la logique de filtrage
3. **Graphiques vides** : Vérifier les données d'exemple

## 🚀 Améliorations Futures

### Fonctionnalités Possibles
- **Filtres multiples** : Combinaison de plusieurs filtres
- **Export des données** : Téléchargement des graphiques
- **Comparaisons temporelles** : Évolution des processus dans le temps
- **Alertes** : Notifications pour certains processus
- **Drill-down** : Navigation vers les détails des issues

### Optimisations
- **Cache des données** : Mise en cache des calculs
- **Lazy loading** : Chargement à la demande
- **Performance** : Optimisation des rendus
