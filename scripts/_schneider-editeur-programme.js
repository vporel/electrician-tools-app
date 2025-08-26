function schneiderEditeurFEF(){
    const $inputFichierEntree = $("#schneider-editeur-programme-fichier-entree")
    const $btnFichierEntree = $("#schneider-editeur-programme-fichier-entree-btn")
    const $inputFichierSortie = $("#schneider-editeur-programme-fichier-sortie")
    const $btnFichierSortie = $("#schneider-editeur-programme-fichier-sortie-btn")
    const $inputFichierMnemoniques = $("#schneider-editeur-programme-fichier-mnemoniques")
    const $btnFichierMnemoniques = $("#schneider-editeur-programme-fichier-mnemoniques-btn")
    const $checkAjouterPrefixes = $("#schneider-editeur-programme-ajouter-prefixes")
    const $selectColonneMnemonique = $("#schneider-editeur-programme-colonne-mnemonique")
    const $selectColonneType = $("#schneider-editeur-programme-colonne-type")
    const $selectColonneAdresse = $("#schneider-editeur-programme-colonne-adresse")
    const $btnExecuter = $("#schneider-editeur-programme-executer-btn")
    const $textareaResultat = $("#schneider-editeur-programme-resultat-textarea")

    const TYPES_ENTREES_SORTIES_TOR = ["E", "S"]
    const TYPES_ENTREES_SORTIES_ANA = ["EA", "SA"]
    const TYPES_ENTREES_SORTIES = [...TYPES_ENTREES_SORTIES_TOR, ...TYPES_ENTREES_SORTIES_ANA]
    const TYPES_RECONNUS = [...TYPES_ENTREES_SORTIES, "M", "MW"]
    const PREFIXES = {E: "IN", S: "OUT", EA: "EA", SA: "SA"}

    $btnFichierEntree.on('click', async function(){
        const path = await ElectronUtils.openFile({filters: [{name: "Fichier projet (.fef)", extensions: ["fef", "xpg"]}]})
        if(path) $inputFichierEntree.val(path)
    }) 

    $btnFichierSortie.on('click', async function(){
        const path = await ElectronUtils.saveFile({filters: [{name: "Fichier projet (.fef)", extensions: ["fef", "xpg"]}]})
        if(path) $inputFichierSortie.val(path)
    }) 

    $btnFichierMnemoniques.on('click', async function(){
        const path = await ElectronUtils.openFile({filters: [{name: "Fichiers Excel (.xlsx, .xls)", extensions: ["xlsx", "xls"]}]})
        if(path) $inputFichierMnemoniques.val(path)
    }) 

    async function executer(){
        const fichierEntree = $inputFichierEntree.val()
        const fichierSortie = $inputFichierSortie.val()
        const fichierMnemoniques = $inputFichierMnemoniques.val()
        const colonneMnemonique = mappingLettresColonnes[$selectColonneMnemonique.val()]
        const colonneType = mappingLettresColonnes[$selectColonneType.val()]
        const colonneAdresse = mappingLettresColonnes[$selectColonneAdresse.val()]
        const ajouterPrefixes = $checkAjouterPrefixes.prop("checked")
        $textareaResultat.addClass("d-none").removeClass("d-block")
        const champs = [fichierMnemoniques, fichierSortie, colonneMnemonique, colonneAdresse]
        if(champs.includes("") || champs.includes(undefined)){
            ToastifyUtils.error("Complétez tous les champs")
            return 
        }
        const splitFichierEntree = fichierEntree.split(".")
        const splitFichierSortie = fichierSortie.split(".")
        if(splitFichierEntree[splitFichierEntree.length - 1].toLowerCase() != splitFichierSortie[splitFichierSortie.length - 1].toLowerCase()){
            ToastifyUtils.error("Le fichier d'entrée et le fichier de sortie doivent avoir la même extension")
            return
        }
        if(Array.from(new Set([colonneMnemonique, colonneType, colonneAdresse])).length < 3){
            ToastifyUtils.error("Deux colonnes ont la même lettre")
            return
        }
        const contenuFichierMnemoniques = await MiscUtils.readExcelFile(fichierMnemoniques)
        if(!contenuFichierMnemoniques || contenuFichierMnemoniques.length == 0){
            ToastifyUtils.error("Le fichier mnémoniques est vide ou illisible")
            return
        }
        let donneesFEF = await MiscUtils.readFile(fichierEntree, "utf-8")
        if(typeof donneesFEF != "string") donneesFEF = donneesFEF.toString()
        const listeMnemoniques = contenuFichierMnemoniques[0].data.slice(1) //Première feuille, suppression de la première ligne qui est l'entête
        //Creation des objets pour le fichier xml
        const erreurs = []
        const listeMnemoniquesVerifies = [] 
        for(const ligne of listeMnemoniques){
            let mnemonique = (ligne[colonneMnemonique] ?? "").trim()
            if(mnemonique == "") continue
            if(!/^[A-Za-z0-9_]+$/.test(mnemonique)){
                erreurs.push(`${mnemonique} : Le mnémonique contient un caractère invalide`)
                continue
            }
            
            let adresse = (ligne[colonneAdresse] ?? "").trim()
            if(adresse == ""){
                erreurs.push(`${mnemonique} : Aucune adresse définie`)
                continue
            } 
            if(!adresse.startsWith("%")) adresse = "%"+adresse
            
            if(ajouterPrefixes){
                //Le contrôle du type se fait uniquement si l'ajout des préfixes est demandé
                let type = (ligne[colonneType] ?? "").trim()
                if(type == ""){
                    erreurs.push(`${mnemonique} : Aucun type défini`)
                    continue
                } 
                if(!TYPES_RECONNUS.includes(type)){
                    erreurs.push(`${mnemonique} : Le type '${type}' n'est pas reconnu`)
                    continue
                }
                if(TYPES_ENTREES_SORTIES.includes(type)) mnemonique = PREFIXES[type] + "_"+mnemonique  
            } 
            
            if(mnemonique.length > 32){
                erreurs.push(`${mnemonique} : Longeur maximale mnémonique dépassée`)
                continue
            }
            listeMnemoniquesVerifies.push({adresse, mnemonique})
        }
        for(const ligne of listeMnemoniquesVerifies.sort((a, b) => b.adresse.length - a.adresse.length)){ //Classer par longueurs d'adresses décroissantes pour eviter des collisions
            donneesFEF = donneesFEF.replaceAll(ligne.adresse, ligne.mnemonique)
        }
        if(erreurs.length > 0){
            $textareaResultat.val(erreurs.join("\n"))
            $textareaResultat.addClass("d-block").removeClass("d-none")
            return
        }
        if(await MiscUtils.writeFile(fichierSortie, donneesFEF))
            ToastifyUtils.success("Traitement terminé")
        else
            ToastifyUtils.error("Echec de la création du fichier")
    }

    $btnExecuter.on('click', async function(){
        startBtnLoading($btnExecuter)
        await executer()
        stopBtnLoading($btnExecuter)
    })
}

waitJQuery(schneiderEditeurFEF)