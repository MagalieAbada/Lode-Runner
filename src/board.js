/*
   Fichier: board.js
   Nom: Magalie Abada
   But: Gestion de la grille de jeu
*/

/* ----- Variables -----*/
const CELL = 32;
const NB_COLS = 28;
const NB_LIGNES = 17;

let grille = [];

const VIDE = 0;
const BRIQUE = 1;
const BETON = 2;
const ECHELLE = 3;
const BARRE = 4;
const OR = 5;
const TROU = 6;

/* 
    '.' = vide 
    '#' = brique 
    'B' = béton 
    'E' = échelle 
    '-' = barre 
    'O' = or 
*/
const LEVEL1 = [
    "............................",
    "....O.......................",
    "#######E#######.............",
    ".......E----------.....O....",
    ".......E....##E...#######E##",
    ".......E....##E..........E..",
    ".......E....##E.......O..E..",
    "##E#####....########E#######",
    "..E.................E.......",
    "..E.................E.......",
    "#########E##########E.......",
    ".........E..........E.......",
    ".......O.E----------E...O...",
    "....E######.........#######E",
    "....E.............O........E",
    "############################",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBB"
];

const ECHELLE_SORTIE = [
    {l: 0, c: 19},
    {l: 1, c: 19},
    {l: 2, c: 19},
    {l: 3, c: 19}
];

let sortieActive = false;


/* ----- Fonctions -----*/

/*
|-----------------------------------------------------------------------------|
| initGrille:
|   Crée la grille aux bonnes dimensions et la remplit
|-----------------------------------------------------------------------------|
*/
function initGrille() {
    grille = [];

    for (let indexLignes = 0; indexLignes < NB_LIGNES; indexLignes++) {
        const ligne = [];
        for (let indexCol = 0; indexCol < NB_COLS; indexCol++) {
            // Récupérer le symbole correspondant à cette case
            let symbole = LEVEL1[indexLignes][indexCol];

            // Ajouter la valeur du symbole dans le tableau de la ligne
            switch (symbole) {
                case '.': ligne.push(VIDE); break;
                case '#': ligne.push(BRIQUE); break;
                case 'B': ligne.push(BETON); break;
                case 'E': ligne.push(ECHELLE); break;
                case '-': ligne.push(BARRE); break;
                case 'O': ligne.push(OR); break;

                default: ligne.push(VIDE); break;
            }
        }

        grille.push(ligne);
    }
}


/*
|-----------------------------------------------------------------------------|
| dessinerFond:
|   Colore le canva de noir 
|-----------------------------------------------------------------------------|
*/
function dessinerFond() {
    objC2D.fillStyle = "#000000";
    objC2D.fillRect(0, 0, NB_COLS * CELL, NB_LIGNES * CELL);
}


/*
|-----------------------------------------------------------------------------|
| dessinerGrille:
|   Dessine les cases selon les symboles du niveau
|-----------------------------------------------------------------------------|
*/
function dessinerGrille() {
    for (let indexLignes = 0; indexLignes < NB_LIGNES; indexLignes++) {
        for (let indexCol = 0; indexCol < NB_COLS; indexCol++) {
            let typeCase = grille[indexLignes][indexCol];

            let x = colVersPixel(indexCol);
            let y = ligneVersPixel(indexLignes);

            switch (typeCase) {
                case VIDE: break;
                case BRIQUE: dessinerCaseBrique(x, y); break;
                case BETON: dessinerCaseBeton(x, y); break;
                case ECHELLE: dessinerEchelle(x, y); break;
                case BARRE: dessinerBarre(x, y); break;
                case OR: dessinerOr(x, y); break;
                case TROU: dessinerTrou(x, y); break;
                default: break;
            }
        }
    }
}


/*
|-----------------------------------------------------------------------------|
| dessinerCaseBeton:
|   Colore la case de gris
|-----------------------------------------------------------------------------|
*/
function dessinerCaseBeton(x, y) {
    // Fond de la pierre
    objC2D.fillStyle = "#7A7A8C";
    objC2D.fillRect(x, y, CELL, CELL);

    // Face légèrement plus claire
    objC2D.fillStyle = "#8E8EA0";
    objC2D.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);

    // Bordure haute et gauche
    objC2D.fillStyle = "#AAAABB";
    objC2D.fillRect(x + 2, y + 2, CELL - 4, 2);
    objC2D.fillRect(x + 2, y + 2, 2, CELL - 4);

    // Bordure basse et droite
    objC2D.fillStyle = "#55556A";
    objC2D.fillRect(x + 2, y + CELL - 4, CELL - 4, 2);
    objC2D.fillRect(x + CELL - 4, y + 2, 2, CELL - 4);

    // Joint extérieur
    objC2D.strokeStyle = "#444455";
    objC2D.lineWidth = 1;
    objC2D.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
}


/*
|-----------------------------------------------------------------------------|
| dessinerCaseBrique:
|   Colore la case de brique
|-----------------------------------------------------------------------------|
*/
function dessinerCaseBrique(x, y) {
    objC2D.fillStyle = "#A30808";
    objC2D.fillRect(x, y, CELL, CELL);

    objC2D.strokeStyle = "#7A0606";
    objC2D.lineWidth = 1;

    objC2D.strokeRect(x + 1, y + 1, CELL - 2, CELL/2 - 1);
    objC2D.strokeRect(x + CELL/2, y + CELL/2 + 1, CELL/2 - 1, CELL/2 - 2);
    objC2D.strokeRect(x + 1, y + CELL/2 + 1, CELL/2 - 1, CELL/2 - 2);
}


/*
|-----------------------------------------------------------------------------|
| dessinerEchelle:
|   Dessine l'échelle
|-----------------------------------------------------------------------------|
*/
function dessinerEchelle(x, y) {
    objC2D.fillStyle = "#108DD6";

    // Les montants
    objC2D.fillRect(x, y, 4, CELL);
    objC2D.fillRect(x + 28, y, 4, CELL);

    // Les barreaux
    for (let yBarreau = y + 3; yBarreau < y + CELL; yBarreau += 6)
        objC2D.fillRect(x + 4, yBarreau, 24, 1);
}


/*
|-----------------------------------------------------------------------------|
| dessinerBarre:
|   Dessine la barre
|-----------------------------------------------------------------------------|
*/
function dessinerBarre(x, y) {
    objC2D.fillStyle = "#108DD6";
    objC2D.fillRect(x, y + 4, CELL, 2);
}

/*
|-----------------------------------------------------------------------------|
| dessinerOr:
|   Dessine le tas d'or
|-----------------------------------------------------------------------------|
*/
function dessinerOr(x, y) {
    objC2D.fillStyle = "#F4C430";

    // Tas d'or (lingots)
    objC2D.fillRect(x + 6, y + 26, 20, 6);
    objC2D.fillRect(x + 8, y + 22, 16, 6);
    objC2D.fillRect(x + 10, y + 18, 12, 6);
}


/*
|-----------------------------------------------------------------------------|
| dessinerTrou:
|   Dessine le trou
|-----------------------------------------------------------------------------|
*/
function dessinerTrou(x, y) {
    objC2D.fillStyle = "#000000";
    objC2D.fillRect(x, y, CELL, CELL);
}


/*
|-----------------------------------------------------------------------------|
| dessinerGameOver:
|   Dessine l'écran final de GAME OVER
|-----------------------------------------------------------------------------|
*/
function dessinerGameOver() {
    objC2D.save();
    const largeurCanva = objCanvas.width;
    const hauteurCanva = objCanvas.height;

    objC2D.fillStyle = "rgba(0,0,0,0.6)";
    objC2D.fillRect(0, 0, largeurCanva, hauteurCanva);

    const largeurBox = largeurCanva / 3;
    const hauteurBox = hauteurCanva / 3;

    // Position angle haut gauche de la boîte
    const x = (largeurCanva - largeurBox) / 2;
    const y = (hauteurCanva - hauteurBox) / 2;

    // Boîte
    objC2D.fillStyle = "#111";
    objC2D.fillRect(x, y, largeurBox, hauteurBox);

    objC2D.strokeStyle = "#FFFFFF";
    objC2D.lineWidth = 3;
    objC2D.strokeRect(x, y, largeurBox, hauteurBox);

    // Texte
    objC2D.fillStyle = "#FFFFFF";
    objC2D.textAlign = "center";

    objC2D.font = "36px Impact";
    objC2D.fillText("GAME OVER", largeurCanva / 2, y + 60);

    objC2D.font = "24px Impact";

    objC2D.fillText("Score : " + scoreTotal, largeurCanva / 2, y + 110);

    objC2D.font = "16px Impact";
    objC2D.fillText("Appuyer sur ENTRER pour recommencer", 
                        largeurCanva / 2, y + hauteurBox - 40);
    objC2D.restore();
}


/*
|-----------------------------------------------------------------------------|
| dessinerVictoire:
|   Dessine l'écran final de GAME OVER
|-----------------------------------------------------------------------------|
*/
function dessinerVictoire() {
    objC2D.save();
    const largeurCanva = objCanvas.width;
    const hauteurCanva = objCanvas.height;

    objC2D.fillStyle = "rgba(0,0,0,0.6)";
    objC2D.fillRect(0, 0, largeurCanva, hauteurCanva);

    const largeurBox = largeurCanva / 3;
    const hauteurBox = hauteurCanva / 3;

    // Position angle haut gauche de la boîte
    const x = (largeurCanva - largeurBox) / 2;
    const y = (hauteurCanva - hauteurBox) / 2;

    // Boîte
    objC2D.fillStyle = "#111111";
    objC2D.fillRect(x, y, largeurBox, hauteurBox);

    objC2D.strokeStyle = "#FFFFFF";
    objC2D.lineWidth = 3;
    objC2D.strokeRect(x, y, largeurBox, hauteurBox);

    // Texte
    objC2D.fillStyle = "#FFFFFF";
    objC2D.textAlign = "center";

    objC2D.font = "36px Impact";
    objC2D.fillText("Victoire", largeurCanva / 2, y + 60);

    objC2D.font = "24px Impact";

    objC2D.fillText("Score : " + scoreTotal, largeurCanva / 2, y + 110);

    objC2D.font = "16px Impact";
    objC2D.fillText("Appuyer sur ENTRER pour recommencer", 
                        largeurCanva / 2, y + hauteurBox - 40);
    objC2D.restore();
}


/*
|-----------------------------------------------------------------------------|
| initSortie:
|   Initialise la sortie (cachée)
|-----------------------------------------------------------------------------|
*/
function initSortie() {
    sortieActive = false;
}


/*
|-----------------------------------------------------------------------------|
| activerSortie:
|   Affiche la sortie
|-----------------------------------------------------------------------------|
*/
function activerSortie() {
    if (sortieActive) return;

    sortieActive = true;

    for (const cell of ECHELLE_SORTIE) {
        grille[cell.l][cell.c] = ECHELLE;
    }
}

/*
|-----------------------------------------------------------------------------|
| getTypeCase:
|   Retourne le type de la cellule testée
|   Si la cellule est hors du cadre, retourne BETON
|-----------------------------------------------------------------------------|
*/
function getTypeCase(ligne, col) {
    if (ligne < 0 || ligne >= NB_LIGNES || col < 0 || col >= NB_COLS)
        return BETON; // limites du canva
    return grille[ligne][col];
}


/*
|-----------------------------------------------------------------------------|
| estSolide / estEchelle / estBarre :
|   Vérifie si la cellule est d'un type spécifique
|   Retourne vrai ou faux
|-----------------------------------------------------------------------------|
*/
function estSolide(type) {
    return type === BRIQUE || type === BETON;
}
function estEchelle(type) {
    return type === ECHELLE;
}
function estBarre(type) {
    return type === BARRE;
}


/*
|-----------------------------------------------------------------------------|
| estBloquantPourDeplacement:
|   Vérifie si la cellule est solide ou un trou occupé
|   Retourne vrai ou faux
|-----------------------------------------------------------------------------|
*/
function estBloquantPourDeplacement(ligne, col) {
    const type = getTypeCase(ligne, col);

    if (estSolide(type)) {
        return true;
    }
    if (type === TROU && trouOccupe(ligne, col)) {
        return true;
    }
    return false;
}


/*
|-----------------------------------------------------------------------------|
| pixelVersCol / pixelVersLigne :
|   Convertit la position en pixel vers la colonne / ligne correspondante
|-----------------------------------------------------------------------------|
*/
function pixelVersCol(x) {
    return Math.floor(x / CELL);
}
function pixelVersLigne(y) {
    return Math.floor(y / CELL);
}

/*
|-----------------------------------------------------------------------------|
| colVersPixel / ligneVersPixel :
|   Convertit la colonne / ligne vers la position en pixel
|-----------------------------------------------------------------------------|
*/
function colVersPixel(col) {
    return col * CELL;
}
function ligneVersPixel(ligne) {
    return ligne * CELL;
}
