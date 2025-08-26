/* CONSTANTES */

const mappingLettresColonnes = {A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8}

/* FONCTIONS */

function waitJQuery(callable){
    if(window.$)
        callable()
    else
        setTimeout(() => {waitJQuery(callable)}, 25)
}

/**
 * Mettre un bouton en mode chargement
 * Il doit contenir un élément de classe .icon et un élément de classe .spinner
 * @param {*} $btn 
 */
function startBtnLoading($btn){
    $btn.attr("disabled", true)
    $btn.find(".icon").removeClass("d-block").addClass("d-none")
    $btn.find(".spinner").removeClass("d-none").addClass("d-block")
}

/**
 * Sortir un bouton du mode chargement
 * Il doit contenir un élément de classe .icon et un élément de classe .spinner
 * @param {*} $btn 
 */
function stopBtnLoading($btn){
    $btn.attr("disabled", false)
    $btn.find(".icon").removeClass("d-none").addClass("d-block")
    $btn.find(".spinner").removeClass("d-block").addClass("d-none")
}

/**
 * 
 * @param {string} nomBaseFichier 
 * @param {string} ref 
 * @returns {boolean}
 */
function testNomFichierReference(nomBaseFichier, ref){
    nomBaseFichier = nomBaseFichier.toUpperCase()
    ref = ref.toUpperCase()
    
    return nomBaseFichier.indexOf(ref) != -1 || 
            nomBaseFichier.indexOf(ref.replaceAll(" ", "")) != -1 || 
            nomBaseFichier.indexOf(ref.replaceAll("/", "-")) != -1 || 
            nomBaseFichier.indexOf(ref.replaceAll("-", " ")) != -1 || 
            nomBaseFichier.indexOf(ref.replaceAll("-", "")) != -1
}

/**
 * Extraire le nom à partir d'un chemin de fichier
 * @param {*} cheminFichier 
 * @returns 
 */
function extraireNomFichier(cheminFichier) {
    return cheminFichier.split('/').pop().split('\\').pop();
}

/**
 * Extraire la référence d'un chemin de fichier
 * @param {*} cheminFichier 
 * @returns 
 */
function extraireReference(cheminFichier) {
    // Supprimer les suffixes comme _DATASHEET_FR
    return extraireNomFichier(cheminFichier).replace(/_.*$/, '');
}

/**
 * Extraire le fabricant d'un chemin de fichier
 * @param {*} cheminFichier 
 * @returns 
 */
function extraireFabricant(cheminFichier) {
    const split = cheminFichier.replaceAll("\\", "/").replaceAll("//", "/").split('/')
    return split[split.length-2]
}