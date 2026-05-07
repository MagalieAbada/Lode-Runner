/*
    Fichier: guards.js
    Nom: Magalie Abada
    But: Gestion des gardes
*/


/* ----- Variables -----*/
let tabGardes = [];
const GARDE_COULEURS = ["#FF3B30", "#34C759", "#AF52DE", "#FF9500", "#0A84FF"];



/* ----- Fonctions de base -----*/

/*
|-----------------------------------------------------------------------------|
| initGardes:
|   Initialise les gardes selon le niveau
|-----------------------------------------------------------------------------|
*/
function initGardes(nb) {
    tabGardes = [];
    for (let i = 0; i < nb; i++) {
        const garde = creerGarde(i);
        placerGardeAleatoire(garde);
        tabGardes.push(garde);
    }
}


/*
|-----------------------------------------------------------------------------|
| dessinerGardes:
|   Dessiner tous les gardes
|-----------------------------------------------------------------------------|
*/
function dessinerGardes() {
    for (const g of tabGardes) {
        dessinerUnGarde(g);
    }
}


/*
|-----------------------------------------------------------------------------|
| updateGardes:
|   Gère les déplacements des gardes
|-----------------------------------------------------------------------------|
*/
function updateGardes() {
    for (const g of tabGardes) updateUnGarde(g);

    // Collision garde <-> joueur = mort
    if (lodeRunner && lodeRunner.enVie) {
        for (const g of tabGardes) {
            if (collisionAABB(lodeRunner, g)) {
                perdreNiveau();
                break;
            }
        }
    }
}



/* ----- Création et placement -----*/

/*
|-----------------------------------------------------------------------------|
| creerGarde:
|   Crée un garde avec les propriétés de base
|-----------------------------------------------------------------------------|
*/
function creerGarde(id) {
    return {
        id,

        // Position
        x: 0,
        y: 0,

        // Taille
        l: CELL,
        h: CELL,

        // Vitesse
        vx: 1.5,
        vy: 1.5,

        // Direction / état
        dir: (Math.random() < 0.5 ? "gauche" : "droite"),
        enChute: false,

        // Trou
        dansTrou: false,

        trouL: -1,
        trouC: -1,
        sortieTrouMs: 0,
        immunTrouJusquaMs: 0,

        // Or
        aUnLingot: false,
        prochainDropMs: performance.now() + 2000 + Math.random() * 2500,
        couleur: GARDE_COULEURS[id % GARDE_COULEURS.length]
    };
}


/*
|-----------------------------------------------------------------------------|
| placerGardeAleatoire:
|   Définit une position aléatoire pour un garde.
|       - sur une cellule VIDE, avec SOLIDE dessous
|       - pas sur la passerelle du bas
|       - pas sur un OR
|       - pas sur échelle, pas sur barre
|       - pas sur un autre garde
|-----------------------------------------------------------------------------|
*/
function placerGardeAleatoire(g) {
    const essaisMax = 1000;

    for (let essais = 0; essais < essaisMax; essais++) {
        // Génération d'une position aléatoire
        const l = Math.floor(Math.random() * (NB_LIGNES - 3)) + 1;
        const c = Math.floor(Math.random() * NB_COLS);

        // Si sur la ligne du bas, on refait un essai
        if (l >= (NB_LIGNES - 3)) continue;

        // Test du type de case
        const typeCase = getTypeCase(l, c);
        const typeDessous = getTypeCase(l + 1, c);

        // La cellule où on veut mettre le garde doit être VIDE
        if (typeCase !== VIDE) continue;

        // La cellule en dessous doit être solide (BRIQUE ou BETON)
        if (!estSolide(typeDessous)) continue;

        // Aucun garde ne doit être déjà présent sur cette case
        let dejaOccupe = false;

        for (let i = 0; i < tabGardes.length; i++) {
            let testGarde = tabGardes[i];
        
            let ligneGarde = pixelVersLigne(testGarde.y);
            let colGarde = pixelVersCol(testGarde.x);
        
            if (ligneGarde === l && colGarde === c) {
                dejaOccupe = true;
                break;
            }
        }

        if (dejaOccupe) continue;

        // Si case valdie, on place le garde
        g.x = colVersPixel(c);
        g.y = ligneVersPixel(l);
        return;
    }
}


/* ----- Dessin -----*/

/*
|-----------------------------------------------------------------------------|
| dessinerUnGarde:
|   Dessine un garde.
|-----------------------------------------------------------------------------|
*/
function dessinerUnGarde(g) {

    objC2D.fillStyle = g.couleur;
    objC2D.fillRect(g.x + 10, g.y + 6, 12, 18);

    objC2D.fillStyle = "#FFFFFF";
    objC2D.fillRect(g.x + 12, g.y + 2, 8, 6);

    objC2D.fillStyle = g.aUnLingot ? "#FFD700" : "#FFFFFF";
    objC2D.fillRect(g.x + 10, g.y + 24, 5, 6);
    objC2D.fillRect(g.x + 17, g.y + 24, 5, 6);
}


/* ----- Déplacements des gardes -----*/

/*
|-----------------------------------------------------------------------------|
| updateUnGarde:
|   Gère les déplacements d'un garde
|-----------------------------------------------------------------------------|
*/
function updateUnGarde(g) {
    const now = performance.now();

    // Si coincé dans un trou
    if (g.dansTrou) {
        const typeCase = getTypeCase(g.trouL, g.trouC);
        // Si le trou s'est rebouché, le garde meurt et respawn ailleurs
        if (typeCase !== TROU) {
            scoreGardeMeurtRessuscite();

            libererTrouOccupe(g.trouL, g.trouC, g.id);
            respawnGardeLigne2(g);
            return;
        }

        // Si le garde est dans le trou depuis 4 secondes ou plus, il ressort
        if (now >= g.sortieTrouMs) {
            libererTrouOccupe(g.trouL, g.trouC, g.id);
            g.dansTrou = false;

            g.y = ligneVersPixel(g.trouL - 1);
            g.x = colVersPixel(g.trouC);

            g.immunTrouJusquaMs = performance.now() + 500;

            g.dir = (Math.random() < 0.5 ? "gauche" : "droite");
            return;
        }
        return;
    }

    // Déplacements du garde
    deplacementSimple(g);

    // Gravité appliquée aux gardes
    appliquerGraviteGarde(g);

    // Ramasser l'or
    const colG = getColCentreG(g);
    const ligneG = getLigneCentreG(g);
    if (!g.aUnLingot && ramasserOrSurCase(ligneG, colG)) {
        g.aUnLingot = true;
    }

    // Relâcher l'or de temps en temps
    tenterRelacherOr(g);
}


/*
|-----------------------------------------------------------------------------|
| deplacementSimple:
|   Algorithme de déplacement simple pour un garde.
|-----------------------------------------------------------------------------|
*/
function deplacementSimple(g) {
    if (etatJeu !== ETAT_EN_COURS) return;

    const colG = getColCentreG(g);
    const ligneG = getLignePiedsG(g);
    const colLR = getColCentre();
    const ligneLR = getLignePieds();

    const ligneDessous = pixelVersLigne(g.y + g.h);
    const typeDessous = getTypeCase(ligneDessous, colG);

    const surEchelle = estSurEchelleG(g);
    const auSommet = estAuSommetEchelleG(g);

    // Déplacement vertical (sur une echelle)
    if (surEchelle || auSommet) { 
        if (ligneLR < ligneG && surEchelle && !auSommet) {
            monterGarde(g);
            return;
        }
        if (ligneLR > ligneG && !estSolide(typeDessous)) {
            descendreGarde(g);
            return;
        } 
        if (ligneG === ligneLR && estEchelle(typeDessous) && !auSommet) {
            descendreGarde(g);
            return;
        }
        if (ligneG === ligneLR && estEchelle(typeDessous) && auSommet) {
            monterGarde(g);
            return;
        }

        g.dir = (colLR < colG ? "gauche" : "droite");
        deplacerHorizontalGarde(g);
        return;
    }

    const memeLigne = Math.abs(ligneG - ligneLR) <= 1;

    // Proba de se diriger vers Lode Runner
    if (memeLigne && Math.random() < 0.8) {
        g.dir = (colLR < colG ? "gauche" : "droite");
    } else if (!memeLigne) {
        const colEchelle = trouverColEchelleProche(g);
        if (colEchelle !== -1) {
            g.dir = (colEchelle < colG ? "gauche" : "droite");
        } else if (Math.random() < 0.01) {
            g.dir = (g.dir === "gauche" ? "droite" : "gauche");
        }
    }

    deplacerHorizontalGarde(g);
}


/*
|-----------------------------------------------------------------------------|
| deplacerHorizontalGarde:
|   Gestion du déplacement horizontal d'un garde
|-----------------------------------------------------------------------------|
*/
function deplacerHorizontalGarde(g) {
    if (g.enChute) return;

    const ligneMilieu = getLigneCentreG(g);
    const lignePieds = getLignePiedsG(g);
    const ligneTete = pixelVersLigne(g.y + 2);

    if (g.dir === "gauche") {
        const colTest = pixelVersCol(g.x - g.vx);

        const bloquantMilieu = estBloquantPourDeplacement(ligneMilieu, colTest);
        const bloquantPieds = estBloquantPourDeplacement(lignePieds, colTest);
        const bloquantTete = estBloquantPourDeplacement(ligneTete, colTest);

        if (!bloquantMilieu && !bloquantPieds && !bloquantTete) {
            g.x -= g.vx;
        } else {
            g.dir = "droite";
        }
    } else {
        const colTest = pixelVersCol(g.x + g.vx + g.l -1);

        const bloquantMilieu = estBloquantPourDeplacement(ligneMilieu, colTest);
        const bloquantPieds = estBloquantPourDeplacement(lignePieds, colTest);
        const bloquantTete = estBloquantPourDeplacement(ligneTete, colTest);

        if (!bloquantMilieu && !bloquantPieds && !bloquantTete) {
            g.x += g.vx;
        } else {
            g.dir = "gauche";
        }
    }
}


/*
|-----------------------------------------------------------------------------|
| monterGarde:
|   Gestion du déplacement vertical d'un garde vers le haut
|-----------------------------------------------------------------------------|
*/
function monterGarde(g) {
    const colEchelle = colTestEchelleG(g);
    const auSommet = estAuSommetEchelleG(g);
    const echelleActive = estSurEchelleG(g) || auSommet;

    if (!echelleActive) return;

    if (auSommet) {
        const lignePieds = getLignePiedsG(g);
        const yVoulu = lignePieds * CELL - (g.h - 1);
        if (g.y > yVoulu) {
            g.y -= g.vy;
        } else {
            g.y = yVoulu;
        }
        return;
    }

    const ligneTest = pixelVersLigne(g.y - g.vy);
    const typeH = getTypeCase(ligneTest, colEchelle);

    if (!estSolide(typeH)) {
        g.y -= g.vy;
    }
}


/*
|-----------------------------------------------------------------------------|
| descendreGarde:
|   Gestion du déplacement vertical d'un garde vers le bas
|-----------------------------------------------------------------------------|
*/
function descendreGarde(g) {
    const colEchelle = colTestEchelleG(g);
    const echelleActive = estSurEchelleG(g) || estAuSommetEchelleG(g);

    if (!echelleActive) return;

    const ligneTest = pixelVersLigne(g.y + g.vy + g.h - 1);
    const typeH = getTypeCase(ligneTest, colEchelle);

    if (!estSolide(typeH)) {
        g.y += g.vy;
    } else {
        const ligneDessous = pixelVersLigne(g.y + g.h);
        g.y = ligneDessous * CELL - (g.h-1);
    }
}


/*
|-----------------------------------------------------------------------------|
| trouverColEchelleProche:
|   Recherche l'échelle la plus proche
|-----------------------------------------------------------------------------|
*/
function trouverColEchelleProche(g) {
    const ligneG = getLignePiedsG(g);
    const colG = getColCentreG(g);
    const colLR = getColCentre();
    const ligneLR = getLignePieds();

    // Chercher dans la direction du Lode Runner
    const versGauche = colLR < colG;

    let meilleureCol = -1;
    let meilleurScore = -1;

    for (let c = 0; c < NB_COLS; c++) {
        if (versGauche && c >= colG) continue;
        if (!versGauche && c <= colG) continue;

        if (!estEchelle(getTypeCase(ligneG, c)) && 
            !estEchelle(getTypeCase(ligneG - 1, c))) continue;
        
        let ligneHaut = ligneG;
        let ligneBas = ligneG;

        while (ligneHaut > 0 && estEchelle(getTypeCase(ligneHaut - 1, c))) ligneHaut--;
        while (ligneBas < NB_LIGNES - 1 && estEchelle(getTypeCase(ligneBas + 1, c))) ligneBas++;

        const ligneAtteinte = ligneLR < ligneG ? ligneHaut : ligneBas;

        // Voir si cette echelle rapproche de Lode Runner
        const distAvant = Math.abs(ligneLR - ligneG);
        const distApres = Math.abs(ligneLR - ligneAtteinte);
        const rapprochement = distAvant - distApres;

        if (rapprochement <= 0) continue;

        // Score de rapprochement
        const distH = Math.abs(c - colG);
        const score = rapprochement * 1.5 - distH;

        if (score > meilleurScore) {
            meilleurScore = score;
            meilleureCol = c;
        }
    }
    return meilleureCol;
}


/*
|-----------------------------------------------------------------------------|
| collisionAABB:
|   Vérifie s'il y a une collision entre garde et Lode Runner
|-----------------------------------------------------------------------------|
*/
function collisionAABB(a, b) {
    const marge = 6;
    return (
        a.x + marge < b.x + b.l - marge &&  // le bord gauche de A est avant le bord droit de B
        a.x + a.l - marge > b.x + marge &&  // le bord droit de A dépasse le bord gauche de B
        a.y + marge < b.y + b.h - marge &&  // le haut de A est avant le bas de B
        a.y + a.h - marge > b.y + marge     // le bas de A dépasse le haut de B
    );
}


/* ----- Gravité et trous -----*/

/*
|-----------------------------------------------------------------------------|
| appliquerGraviteGarde:
|   Fait tomber le garde si rien ne le supporte
|-----------------------------------------------------------------------------|
*/
function appliquerGraviteGarde(g) {
    // Si sur une echelle
    const colCentre = getColCentreG(g);
    const ligneCentre = getLigneCentre();
    const lignePieds = getLignePieds();

    const surEchelleCentre = estEchelle(getTypeCase(ligneCentre, colCentre))
                                || estEchelle(getTypeCase(lignePieds, colCentre));

    if (surEchelleCentre || estAuSommetEchelleG(g)) {
        g.enChute = false;
        return;
    }

    // Si sur barre
    if (estSurBarreG(g)) {
        g.enChute = false;
        return;
    }

    // Colonnes sous les pieds
    const colG = pixelVersCol(g.x + 2);
    const colD = pixelVersCol(g.x + g.l - 3);

    // Ligne sous les pieds
    const ligneDessous = pixelVersLigne(g.y + g.h);

    const typeDessousG = getTypeCase(ligneDessous, colG);
    const typeDessousD = getTypeCase(ligneDessous, colD);
    const typeDessous = getTypeCase(ligneDessous, colCentre);

    // Support = solide OU trou occupé par un garde
    const supportG = estSolide(typeDessousG) || estEchelle(typeDessous) || 
                        (typeDessousG === TROU && trouOccupe(ligneDessous, colG));
    const supportD = estSolide(typeDessousD) || estEchelle(typeDessous) || 
                        (typeDessousD === TROU && trouOccupe(ligneDessous, colD));

    // Vérifier si sous le centre il y a un trou (occupé ou pas)
    const typeDessousCentre = getTypeCase(ligneDessous, colCentre);
    
    if (typeDessous === TROU && !trouOccupe(ligneDessous, colCentre)) {
        if (performance.now() < g.immunTrouJusquaMs) return;
        
        const trou = trouverTrou(ligneDessous, colCentre);
        if (trou) { // Vérifier que trouverTrou != null
            trou.occupe = true;
            trou.gardeId = g.id;

            // Le garde se place dans le trou
            playSound(sonChuteGarde);
            g.x = colVersPixel(colCentre);
            g.y = ligneVersPixel(ligneDessous);

            g.dansTrou = true;
            g.trouL = ligneDessous;
            g.trouC = colCentre;
            g.sortieTrouMs = performance.now() + 4000;

            // Le garde lache son lingot si il en a un
            if (g.aUnLingot) {
                g.aUnLingot = false;
                const lAuDessus = ligneDessous - 1;
                if (getTypeCase(lAuDessus, colCentre) === VIDE) {
                    grille[lAuDessus][colCentre] = OR;
                }
            }

            scoreGardeTombeTrou();
            return;
        }
    }

    // Gravité normale (hors trou)
    if (!supportG && !supportD) {
        g.y += g.vy;
        g.enChute = true;
        return;
    }

    // Atterrissage après une chute
    if (g.enChute) {
        g.y = ligneDessous * CELL - g.h;
    }

    g.enChute = false;
}


/*
|-----------------------------------------------------------------------------|
| respawnGardeLigne2 :
|   Replace un garde sur la 2e ligne sur une case VIDE aléatoire
|-----------------------------------------------------------------------------|
*/
function respawnGardeLigne2(g) {
    // Reset etat du garde
    g.dansTrou = false;
    g.trouL = -1;
    g.trouC = -1;
    g.sortieTrouMs = 0;
    g.enChute = false;
    g.dir = (Math.random() < 0.5 ? "gauche" : "droite");
    g.aUnLingot = false;
    g.prochainDropMs = performance.now() + 2000 + Math.random() * 2500;

    // Respawn sur la 2eme ligne
    const ligneRespawn = 14;
    const essaisMax = 50;
    for (let essais = 0; essais < essaisMax; essais++) {
        const c = Math.floor(Math.random() * NB_COLS);

        // Doit être VIDE
        if (getTypeCase(ligneRespawn, c) !== VIDE) continue;

        // ne doit pas y avoir Lode Runne dessus
        if (lodeRunner.y === ligneVersPixel(ligneRespawn) &&
            lodeRunner.x === colVersPixel(c)) {
                continue;
            }
        
        // Ne doit pas y avoir de garde déjà dessus
        let occupe = false;
        for (const testGarde of tabGardes) {
            if (testGarde === g) continue;
            if (pixelVersLigne(testGarde.y) === ligneRespawn && 
                pixelVersCol(testGarde.x) === c) {
                    occupe = true;
                    break;
            }
        }
        if (occupe) continue;

        // Si ok, on place
        g.x = colVersPixel(c);
        g.y = ligneVersPixel(ligneRespawn);
        playSound(sonMortGarde);
        return;
    }


}


/* ----- Or -----*/

/*
|-----------------------------------------------------------------------------|
| tenterRelacherOr:
|   Permet à un garde de relâcher un lingot d'or de temps en temps
|-----------------------------------------------------------------------------|
*/
function tenterRelacherOr(g) {
    if (!g.aUnLingot) return;

    const now = performance.now();

    // Vérifier si c'Est le moment de dropper
    if (now < g.prochainDropMs) return;

    // Reprogrammer la prochaine tentative
    g.prochainDropMs = now + 2000 + Math.random() * 4000;

    // Position
    const colCentre = getColCentreG(g);
    const ligneCentre = getLigneCentreG(g);

    const typeIci = getTypeCase(ligneCentre, colCentre);
    const typeDessous = getTypeCase(ligneCentre + 1, colCentre);

    // Il faut être dans une case VIDE sur une passerelle
    if (typeIci !== VIDE) return;
    if (!estSolide(typeDessous)) return;

    // Petite probabilité de vraiment lâcher l'or
    if (Math.random() > 0.25) return;

    // Poser le lingot
    grille[ligneCentre][colCentre] = OR;
    g.aUnLingot = false;
}



/* ----- Helpers -----*/

/*
|-----------------------------------------------------------------------------|
| getColCentreG / getLigneCentreG / getLignePiedsG :
|   Retournent les colonnes et lignes du centre et des pieds d'un garde
|-----------------------------------------------------------------------------|
*/
function getColCentreG(g) {
    return pixelVersCol(g.x + g.l / 2);
}
function getLigneCentreG(g) {
    return pixelVersLigne(g.y + g.h / 2);
}
function getLignePiedsG(g) {
    return pixelVersLigne(g.y + g.h - 2);
}


/*
|-----------------------------------------------------------------------------|
| colTestEchelleG:
|   Adapte le test de position sur l'échelle en fonction du mouvement H
|-----------------------------------------------------------------------------|
*/
function colTestEchelleG(g) {
    return pixelVersCol(g.x + g.l / 2);
}


/*
|-----------------------------------------------------------------------------|
| estAuSommetEchelleG:
|   Vérifie si le garde est au sommet d'une cellule ECHELLE
|-----------------------------------------------------------------------------|
*/
function estAuSommetEchelleG(g) {
    const colEchelle = colTestEchelleG(g);
    const lPieds = getLignePiedsG(g);

    const typePieds = getTypeCase(lPieds, colEchelle);
    const typeDessous = getTypeCase(lPieds + 1, colEchelle);

    return !estEchelle(typePieds) && estEchelle(typeDessous);
}


/*
|-----------------------------------------------------------------------------|
| estSurEchelleG:
|   Vérifie si le garde est dans une cellule ECHELLE
|-----------------------------------------------------------------------------|
*/
function estSurEchelleG(g) {
    const colEchelle = colTestEchelleG(g);

    const lCentre = getLigneCentreG(g);
    const lPieds = getLignePiedsG(g);

    const tCentre = getTypeCase(lCentre, colEchelle);
    const tPieds = getTypeCase(lPieds, colEchelle);

    return estEchelle(tCentre) || estEchelle(tPieds);
}


/*
|-----------------------------------------------------------------------------|
| estSurBarreG:
|   Vérifie si le garde est dans une cellule BARRE
|-----------------------------------------------------------------------------|
*/
function estSurBarreG(g) {
    const colCentre = getColCentreG(g);
    const ligneMains = pixelVersLigne(g.y + 10);
    return estBarre(getTypeCase(ligneMains, colCentre));
}
