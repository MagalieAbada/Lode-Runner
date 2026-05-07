/*
   Fichier: hole.js
   Nom: Magalie Abada
   But: Gestion des trous creusés
*/

/* ----- Variables -----*/
let tTrous = [];


/* ----- Fonctions -----*/

/*
|-----------------------------------------------------------------------------|
| initTrous:
|   Initialise le tableau des trous
|-----------------------------------------------------------------------------|
*/
function initTrous() {
    tTrous = [];
}

/*
|-----------------------------------------------------------------------------|
| updateTrous:
|   Gère l'affichage des trous et leur disparition
|-----------------------------------------------------------------------------|
*/
function updateTrous() {
    const now = performance.now();

    for (let i = tTrous.length - 1; i >= 0; i--) {
        const trou = tTrous[i];
        if (now >= trou.finMs) {
            if (lodeRunnerDansCellule(trou.ligne, trou.col)) {
                perdreNiveau();
            }
            if (trou.occupe) {
                const garde = tabGardes.find(g => g.id === trou.gardeId);
                if (garde && garde.dansTrou) {
                    scoreGardeMeurtRessuscite();
                    respawnGardeLigne2(garde);
                }
            }

            if (getTypeCase(trou.ligne, trou.col) === TROU) {
                grille[trou.ligne][trou.col] = BRIQUE;
            }
            tTrous.splice(i, 1);
            
            if (!trou.occupe && !lodeRunnerDansCellule(trou.ligne, trou.col)) {
                playSound(sonTrou);
            }
        }
    }
}


function lodeRunnerDansCellule(ligne, col) {
    // Rectangle du joueur
    const px1 = lodeRunner.x;
    const py1 = lodeRunner.y;
    const px2 = lodeRunner.x + lodeRunner.l - 1;
    const py2 = lodeRunner.y + lodeRunner.h - 1;

    // Rectangle de la cellule
    const cx1 = col * CELL;
    const cy1 = ligne * CELL;
    const cx2 = cx1 + CELL - 1;
    const cy2 = cy1 + CELL - 1;

    // Collision rectangles
    const overlapX = px1 <= cx2 && px2 >= cx1;
    const overlapY = py1 <= cy2 && py2 >= cy1;
    return overlapX && overlapY;
}


function gardeDansCellule(garde, ligne, col) {
    // Rectangle du garde
    const px1 = garde.x;
    const py1 = garde.y;
    const px2 = garde.x + garde.l - 1;
    const py2 = garde.y + garde.h - 1;

    // Rectangle de la cellule
    const cx1 = col * CELL;
    const cy1 = ligne * CELL;
    const cx2 = cx1 + CELL - 1;
    const cy2 = cy1 + CELL - 1;

    // Collision rectangles
    const overlapX = px1 <= cx2 && px2 >= cx1;
    const overlapY = py1 <= cy2 && py2 >= cy1;
    return overlapX && overlapY;
}


/*
|-----------------------------------------------------------------------------|
| tenterCreuser:
|   Essaye de creuser un trou à gauche ou à droite du Lode Runner
|       dir = -1 (gauche) ou +1 (droite)
|-----------------------------------------------------------------------------|
*/
function tenterCreuser(dir) {
    if (!lodeRunner.enVie) return;

    if (lodeRunner.enChute) return;

    // On veut creuser la brique de la "passerelle" sous les pieds
    const colCentre = getColCentre();
    const ligneSous = pixelVersLigne(lodeRunner.y + lodeRunner.h);

    const colTrou = colCentre + dir;
    const ligneTrou = ligneSous;

    // Cible doit être une brique
    const typeCible = getTypeCase(ligneTrou, colTrou);
    if (typeCible !== BRIQUE) return;

    // La cellule au-dessus de la brique à creuser doit être type VIDE
    const typeAuDessus = getTypeCase(ligneTrou - 1, colTrou);
    if (typeAuDessus !== VIDE) return;

    // Si ok, on creuse
    grille[ligneTrou][colTrou] = TROU;
    playSound(sonCreuser);

    // 8 secondes
    tTrous.push({
        ligne: ligneTrou,
        col: colTrou,
        finMs: performance.now() + 8000,
        occupe: false,
        gardeId: -1 
    });
}


/*
|-----------------------------------------------------------------------------|
| libererTrouOccupe:
|   Libère le trou du garde qui était coincé dedans
|-----------------------------------------------------------------------------|
*/
function libererTrouOccupe(ligne, col, gardeId) {
    const t = trouverTrou(ligne, col);
    if (!t) return;
    if (t.gardeId === gardeId) {
        t.occupe = false;
        t.gardeId = -1;
    }
}


/*
|-----------------------------------------------------------------------------|
| trouverTrou:
|   Trouve le trou à la position donnée ou retourne NULL si pas de trou
|-----------------------------------------------------------------------------|
*/
function trouverTrou(ligne, col) {
    // Prend chaque trou t dans tTrous et vérifie t.ligne et t.col
    return tTrous.find(t => t.ligne === ligne && t.col === col) || null;
}


/*
|-----------------------------------------------------------------------------|
| trouOccupe:
|   Vérifie si le trou à la position donnée est occupée par un garde
|-----------------------------------------------------------------------------|
*/
function trouOccupe(ligne, col) {
    const t = trouverTrou(ligne, col);
    return t !== null && t.occupe === true;
}