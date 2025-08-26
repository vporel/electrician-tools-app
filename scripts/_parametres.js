/*
    Paramètres de l'application
*/
//Clés
const PARAMETRE_DOSSIER_BD_MATERIELS = "global.dossier-bd-materiels"

/**
 * Cet objet ne doit pas directement être utilisé en dehors de ce fichier
 * Utiliser la fonction 'lireParametre' afin de récupérer la valeur d'un paramètre
 */
const parametres = {}

//Configuration des parametres
const configurationParametres = {
    [PARAMETRE_DOSSIER_BD_MATERIELS]: {
        estValide: async () => await SystemUtils.fs.exists(parametres[PARAMETRE_DOSSIER_BD_MATERIELS]),
        effacer: async () => {
            parametres[PARAMETRE_DOSSIER_BD_MATERIELS] = ""
            $("#parametres-dossier-bd-materiels-input").val("")
        }
    }
}

/**
 * Liste des clés
 */
const CLES_PARAMETRES = [PARAMETRE_DOSSIER_BD_MATERIELS]

/**
 * 
 * @param {string} cle 
 * @returns {any|null}
 */
async function lireParametre(cle){
    if(await configurationParametres[cle].estValide()){  //contrôle de la validité du paramètre
        return parametres[cle]
    }else{
        await configurationParametres[cle].effacer()
        return null
    }
    
}

function gestionParametres(){
    const $inputDossierBDMateriels = $("#parametres-dossier-bd-materiels-input")
    const $btnDossierBDMateriels = $("#parametres-dossier-bd-materiels-btn")

    //TODO : revoir l'objet SettingsUtils pour pouvoir récupérer tous les paramètres d'un coup
    async function chargerParametres(){
        for(let cle of CLES_PARAMETRES){
            parametres[cle] = await SettingsUtils.get(cle)
            if(!(await configurationParametres[cle].estValide())) await configurationParametres[cle].effacer() //contrôle de la validité du paramètre
        }

        //Chargement dans les inputs
        $inputDossierBDMateriels.val(parametres[PARAMETRE_DOSSIER_BD_MATERIELS] ?? "")
    }
    chargerParametres()

    $btnDossierBDMateriels.on('click', async function(){
        const path = await ElectronUtils.openDirectory()
        if(path){ 
            parametres[PARAMETRE_DOSSIER_BD_MATERIELS] = path
            $inputDossierBDMateriels.val(path)
            await SettingsUtils.set(PARAMETRE_DOSSIER_BD_MATERIELS, path)
        }
    }) 
}

waitJQuery(gestionParametres)