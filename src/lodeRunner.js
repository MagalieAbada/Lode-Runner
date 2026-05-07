/*
    Fichier: lodeRunner.js
    Nom: Magalie Abada
    But: Gestion du joueur (Lode Runner)
*/

/* ----- Variables -----*/
let lodeRunner = null;
const DIR_GAUCHE = "gauche";
const DIR_DROITE = "droite";


/* ----- Fonctions -----*/

/*
|-----------------------------------------------------------------------------|
| initLodeRunner:
|   Initialise les propriétés du Lode Runner et sa position de départ
|-----------------------------------------------------------------------------|
*/
function initLodeRunner() {
    lodeRunner = {
        // Position
        x: 0,
        y: 0,

        // Taille
        l: CELL,
        h: CELL,

        // Vitesse
        vx: 3,
        vy: 3,

        // Direction / état
        dir: DIR_DROITE,
        enChute: false,
        enVie: true,

        // Actions
        bougeG: false,
        bougeD: false,
        bougeH: false,
        bougeB: false,
        creuseG: false,
        creuseD: false,

        // Animation mort Lode Runner
        estEnAnimationMort: false,
        tempsMort: 0,
        yDepartMort: 0
    };

    lodeRunner.x = colVersPixel(13);
    lodeRunner.y = ligneVersPixel(14);
}


/*
|-----------------------------------------------------------------------------|
| dessinerLodeRunner:
|   Dessine le Lode Runner
|-----------------------------------------------------------------------------|
*/
function dessinerLodeRunner() {
    if (!lodeRunner || !lodeRunner.enVie) return;

    objC2D.fillStyle = "#FFFFFF";
    objC2D.fillRect(lodeRunner.x + 10, lodeRunner.y + 6, 12, 18);

    objC2D.fillRect(lodeRunner.x + 12, lodeRunner.y + 2, 8, 6);

    objC2D.fillRect(lodeRunner.x + 10, lodeRunner.y + 24, 5, 6);
    objC2D.fillRect(lodeRunner.x + 17, lodeRunner.y + 24, 5, 6);
}


/*
|-----------------------------------------------------------------------------|
| updateLodeRunner:
|   Gère les déplacements du Lode Runner en fonction des actions en cours
|-----------------------------------------------------------------------------|
*/
function updateLodeRunner() {
    if (!lodeRunner.enVie) return;

    if (etatJeu === ETAT_MORT_ANIM && lodeRunner.estEnAnimationMort) {
        const duree = 2000;
        const ecoule = Date.now() - lodeRunner.tempsMort;
        let progression = ecoule / duree;

        if (progression > 1) progression = 1;

        const yArrivee = -lodeRunner.h;
        lodeRunner.y = lodeRunner.yDepartMort + (yArrivee - lodeRunner.yDepartMort) * progression;

        if (progression >= 1) {
            lodeRunner.estEnAnimationMort = false;
            etatJeu = ETAT_EN_COURS;
            initNiveau();
        }
        return;
    }

    if ((lodeRunner.bougeG || lodeRunner.bougeD) && !lodeRunner.enChute) {
        gererDeplacementHorizontal();
    }

    if (lodeRunner.bougeH || lodeRunner.bougeB) {
        gererMonteeDescenteEchelle();
    }

    // Creuser
    if (lodeRunner.creuseG) {
        tenterCreuser(-1);
        lodeRunner.creuseG = false;
    }
    if (lodeRunner.creuseD) {
        tenterCreuser(+1);
        lodeRunner.creuseD = false;
    }
    appliquerGravite();

    const col = getColCentre();
    const ligne = getLigneCentre();
    const lignePieds = getLignePieds();

    if (ramasserOrSurCase(lignePieds, col)) {
        nbOrRamasse++;
        scoreRamasserOr();
        playSound(sonCoin);
        if (toutOrRamasse()) {
            activerSortie();

        }
    }

    if (sortieActive) {
        if (estSurEchelle() && ligne === 0 && col === 19) {
            gagnerNiveau();
        }
    }
}


/*
|-----------------------------------------------------------------------------|
| gererDeplacementHorizontal:
|   Gestion du déplacement horizontal
|-----------------------------------------------------------------------------|
*/
function gererDeplacementHorizontal() {
    const ligneMilieu = getLigneCentre();
    const lignePieds = getLignePieds();
    const ligneTete = pixelVersLigne(lodeRunner.y + 2);

    if (lodeRunner.bougeG) {
        const colTest = pixelVersCol(lodeRunner.x - lodeRunner.vx);

        const typeMilieu = getTypeCase(ligneMilieu, colTest);
        const typePieds = getTypeCase(lignePieds, colTest);
        const typeTete = getTypeCase(ligneTete, colTest);

        if (!estSolide(typeMilieu) && !estSolide(typePieds) && !estSolide(typeTete)) {
            lodeRunner.x -= lodeRunner.vx;
            lodeRunner.dir = DIR_GAUCHE;
        }
    }
    if (lodeRunner.bougeD) {
        const colTest = pixelVersCol(lodeRunner.x + lodeRunner.vx + lodeRunner.l - 1);

        const typeMilieu = getTypeCase(ligneMilieu, colTest);
        const typePieds = getTypeCase(lignePieds, colTest);
        const typeTete = getTypeCase(ligneTete, colTest);
        
        if (!estSolide(typeMilieu) && !estSolide(typePieds) && !estSolide(typeTete)) {
            lodeRunner.x += lodeRunner.vx;
            lodeRunner.dir = DIR_DROITE;
        }
    }
}


/*
|-----------------------------------------------------------------------------|
| gererMonteeDescenteEchelle:
|   Gestion du déplacement sur les échelles
|-----------------------------------------------------------------------------|
*/
function gererMonteeDescenteEchelle() {
    const colEchelle = getColCentre();

    const auSommet = estAuSommetEchelle();

    const echelleActive = estSurEchelle() || auSommet;

    /* ----- MONTER -----*/
    if (lodeRunner.bougeH && echelleActive) {

        if (auSommet) {
            const ligneEchelle = getLigneCentre() + 1;
            const yVoulu = ligneEchelle * CELL - lodeRunner.h;
            lodeRunner.y = Math.min(lodeRunner.y, yVoulu);
            return;
        }

        const ligneTestH = pixelVersLigne(lodeRunner.y - lodeRunner.vy);
        const typeCelluleH = getTypeCase(ligneTestH, colEchelle);

        if (!estSolide(typeCelluleH)) {
            lodeRunner.y -= lodeRunner.vy;
        }
    }
    /* ----- DESCENDRE -----*/
    if (lodeRunner.bougeB && echelleActive) {
        const ligneTestB = pixelVersLigne(lodeRunner.y + lodeRunner.vy + lodeRunner.h - 1);
        const typeCelluleB = getTypeCase(ligneTestB, colEchelle)

        if (!estSolide(typeCelluleB)) {
            lodeRunner.y += lodeRunner.vy;
        }
    }
}


/*
|-----------------------------------------------------------------------------|
| appliquerGravite:
|   Fait tomber le Lode Runner si rien ne le supporte
|-----------------------------------------------------------------------------|
*/
function appliquerGravite() {
    const ligneSous = pixelVersLigne(lodeRunner.y + lodeRunner.h);
    
    // Si sur une echelle
    const colCentre = getColCentre();
    const ligneCentre = getLigneCentre();
    const lignePieds = getLignePieds();

    const surEchelleCentre = estEchelle(getTypeCase(ligneCentre, colCentre))
                                || estEchelle(getTypeCase(lignePieds, colCentre));

    if (surEchelleCentre  || estAuSommetEchelle()) {
        lodeRunner.enChute = false;
        return;
    }

    const down = lodeRunner.bougeB;
    // Si sur une barre, ne pas tomber SAUF si on presse 'bas'
    if (estSurBarre() && !down) {
        lodeRunner.enChute = false;
        return;
    }

    const typeSous = getTypeCase(ligneSous, colCentre);
    if (estEchelle(typeSous) && !down) {
        lodeRunner.enChute = false;
        return;
    }

    // Si pas sur le sol, appliquer la gravité
    if (!estSurSol() && !estSurEchelle()) {
        if (sonOn === false) {
            sonChute.play();
            sonOn = true;
        }
        lodeRunner.y += lodeRunner.vy;
        lodeRunner.enChute = true;
        return;
    }

    // Atterissage après une chute
    if (lodeRunner.enChute) { 
        lodeRunner.y = ligneSous * CELL - lodeRunner.h;
    }

    lodeRunner.enChute = false;
    sonOn = false;
}


/* ----- Helpers -----*/

/*
|-----------------------------------------------------------------------------|
| plateformeAuNiveauDesPieds:
|   Vérifie si le Lode Runner a une plateforme solide à côté de lui quand
|       il est au sommet d'une échelle
|-----------------------------------------------------------------------------|
*/
function plateformeAuNiveauDesPieds() {
    const colCentre = getColCentre();

    // Ligne des pieds
    const lignePieds = getLignePieds();

    const typeGauche = getTypeCase(lignePieds, colCentre - 1);
    const typeDroite = getTypeCase(lignePieds, colCentre + 1);

    return estSolide(typeGauche) || estSolide(typeDroite);
}


/*
|-----------------------------------------------------------------------------|
| estAuSommetEchelle:
|   Vérifie si le Lode Runner est au sommet d'une cellule ECHELLE
|-----------------------------------------------------------------------------|
*/
function estAuSommetEchelle() {
    const colEchelle = colTestEchelle();
    const ligneCentre = getLigneCentre();

    const typeCentre = getTypeCase(ligneCentre, colEchelle);
    const typeDessous = getTypeCase(ligneCentre + 1, colEchelle);

    return !estEchelle(typeCentre) && estEchelle(typeDessous);
}


/*
|-----------------------------------------------------------------------------|
| estSurEchelle:
|   Vérifie si le Lode Runner est dans une cellule ECHELLE
|-----------------------------------------------------------------------------|
*/
function estSurEchelle() {
    const colEchelle = colTestEchelle();

    const ligneCentre = getLigneCentre();
    const lignePieds  = getLignePieds();

    const typeCentre = getTypeCase(ligneCentre, colEchelle);
    const typePieds  = getTypeCase(lignePieds,  colEchelle);
    
    return estEchelle(typeCentre) || estEchelle(typePieds);
}


/*
|-----------------------------------------------------------------------------|
| colTestEchelle:
|   Adapte le test de position sur l'échelle en fonction du mouvement H
|-----------------------------------------------------------------------------|
*/
function colTestEchelle() {
    // Quand on se décale vers la gauche, on garde l’échelle tant que le bord droit touche
    if (lodeRunner.bougeG) return pixelVersCol(lodeRunner.x + lodeRunner.l - 2);

    // Quand on se décale vers la droite, on garde l’échelle tant que le bord gauche touche
    if (lodeRunner.bougeD) return pixelVersCol(lodeRunner.x + 1);

    // Sinon (pas de mouvement horizontal), centre
    return pixelVersCol(lodeRunner.x + lodeRunner.l / 2);
}


/*
|-----------------------------------------------------------------------------|
| estSurBarre:
|   Vérifie si le Lode Runner est dans une cellule BARRE
|-----------------------------------------------------------------------------|
*/
function estSurBarre() {
    const colCentre = getColCentre();
    const ligneMains = pixelVersLigne(lodeRunner.y + 10);
    return estBarre(getTypeCase(ligneMains, colCentre));
}


/*
|-----------------------------------------------------------------------------|
| estSurSol:
|   Vérifie si le Lode Runner est sur un bloc solide 
|-----------------------------------------------------------------------------|
*/
function estSurSol() {
    const colG = pixelVersCol(lodeRunner.x + 2);
    const colD = pixelVersCol(lodeRunner.x + lodeRunner.l - 3);

    const ligneSous = pixelVersLigne(lodeRunner.y + lodeRunner.h);

    const typeSousG = getTypeCase(ligneSous, colG);
    const typeSousD = getTypeCase(ligneSous, colD);

    const supportG = estSolide(typeSousG) || 
                        (typeSousG === TROU && trouOccupe(ligneSous, colG));
    const supportD = estSolide(typeSousD) || 
                        (typeSousD === TROU && trouOccupe(ligneSous, colD));

    return supportG || supportD;
}


/*
|-----------------------------------------------------------------------------|
| getColCentre / getLigneCentre / getLignePieds :
|   Retournent les colonnes et lignes du centre et des pieds du Lode Runner
|-----------------------------------------------------------------------------|
*/
function getColCentre() {
    return pixelVersCol(lodeRunner.x + lodeRunner.l / 2);
}
function getLigneCentre() {
    return pixelVersLigne(lodeRunner.y + lodeRunner.h / 2);
}
function getLignePieds() {
    return pixelVersLigne(lodeRunner.y + lodeRunner.h - 2);
}