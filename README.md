# World Cup Predictor

Application web éducative en Vue.js 3 + Vite qui affiche des prédictions
statistiques pour des matchs de football de Coupe du Monde à partir de données JSON
locales. La base d’exemple contient les 48 équipes de la Coupe du Monde 2026 et
les 72 matchs de phase de groupes.

## Stack

- Vue.js 3 avec Composition API
- Vite
- Vue Router
- Pinia
- Axios
- Chart.js + vue-chartjs
- Tailwind CSS

## Fonctionnalités

- Liste des matchs avec filtres par groupe, date et équipe
- Page détail avec statistiques des deux équipes
- Probabilités victoire équipe A, match nul, victoire équipe B
- Score probable
- Forme récente
- Historique des confrontations directes
- Badges Favori, Match serré, Confiance élevée/moyenne/faible
- Architecture prête pour remplacer les JSON par une API via `src/services/apiService.js`

## Installation

```sh
npm install
```

## Lancement en développement

```sh
npm run dev
```

## Build de production

```sh
npm run build
```

## Données locales

Les exemples sont dans `src/data` :

- `teams.json` : 48 équipes
- `matches.json` : 72 matchs de groupes
- `performances.json` : performances synthétiques pour les 48 équipes
- `headToHead.json` : historique direct synthétique pour chaque affiche de groupe

## Modèle de prédiction

Le service `src/services/predictionService.js` applique la formule :

```txt
scoreEquipe =
  30% classement FIFA
+ 25% forme récente
+ 20% attaque
+ 15% défense
+ 10% historique direct
```

Le résultat est ensuite converti en probabilités dont le total est toujours égal à
100%.

Cette application est uniquement éducative/statistique et ne contient aucune
fonctionnalité de pari sportif.
