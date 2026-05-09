# Lode Runner – JavaScript Project

Reproduction du premier tableau du jeu classique *Lode Runner (1983)* réalisée dans le cadre du cours de **Programmation 3D**.

Le projet recrée les mécaniques originales du jeu en JavaScript à l'aide d'un cycle d'animation et d'une architecture orientée objets.

---

## Aperçu

Dans *Lode Runner*, le joueur doit récupérer tous les lingots d'or d'un niveau tout en évitant les gardes ennemis.

Une fois tous les lingots récupérés, une échelle de sortie apparaît et permet de passer au niveau suivant.

---

## Règles du jeu

### Objectif

Pour terminer un niveau :

- Ramasser les **6 lingots d'or**
- Éviter les gardes
- Utiliser les trous stratégiquement
- Atteindre l'échelle de sortie lorsqu'elle apparaît

---

## Déplacements du joueur

Le joueur peut :

- Se déplacer horizontalement sur les passerelles
- Monter et descendre les échelles
- Traverser les barres de franchissement
- Tomber automatiquement dans le vide s'il n'y a plus de support

### Contrôles

| Action | Touche |
|--------|--------|
| Gauche | ← |
| Droite | → |
| Monter | ↑ |
| Descendre | ↓ |
| Creuser à gauche | Z |
| Creuser à droite | X |

---

## Les trous

Le joueur peut creuser dans certaines passerelles :

- uniquement dans la brique
- jamais dans le béton
- seulement si aucun objet bloque au-dessus

Les trous :

- restent ouverts **8 secondes**
- peuvent piéger les gardes
- peuvent aussi tuer le joueur s'ils se referment sur lui

---

## Les gardes

Au niveau 1 :

- **3 gardes**

À chaque nouveau niveau :

- +1 garde

Maximum :

- **10 niveaux**

Les gardes :

- se déplacent automatiquement
- peuvent tomber dans les trous
- peuvent ramasser des lingots
- peuvent mourir et réapparaître

---

## Score

| Action | Points |
|--------|--------|
| Ramasser un lingot | +250 |
| Piéger un garde | +75 |
| Mort d'un garde | +75 |
| Compléter un niveau | +1500 |

---

## Vies

Le joueur commence avec :

- **5 vies**

Le joueur perd une vie lorsqu'il :

- entre en collision avec un garde
- reste coincé dans un trou qui se referme

Lorsque toutes les vies sont perdues :

**Game Over**

---

## Technologies utilisées

- JavaScript
- HTML5
- CSS3
- Cycle d'animation
- Architecture objet

---

## Structure du projet

```bash
.
├── ressources/
├── src/
│   ├── index.html
│   ├── board.js
│   ├── eventKeyBoard.js
│   ├── gold.js
│   ├── guards.js
│   ├── hole.js
│   ├── levelManager.js
│   ├── lodeRunner.js
│   └── soundManager.js
└── README.md
```

---


## Auteurs

Projet réalisé par Magalie Abada
