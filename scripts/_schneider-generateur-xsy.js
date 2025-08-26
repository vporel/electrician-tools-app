function schneiderGenerateurXSY(){
    const $inputFichierMnemoniques = $("#schneider-generateur-xsy-fichier-mnemoniques")
    const $selectFeuilleFichierMnemoniques = $("#schneider-generateur-xsy-feuille-fichier-mnemoniques")
    const $btnFichierMnemoniques = $("#schneider-generateur-xsy-fichier-mnemoniques-btn")
    const $inputFichierSortie = $("#schneider-generateur-xsy-fichier-sortie")
    const $btnFichierSortie = $("#schneider-generateur-xsy-fichier-sortie-btn")
    const $checkAjouterPrefixes = $("#schneider-generateur-xsy-ajouter-prefixes")
    const $selectColonneMnemonique = $("#schneider-generateur-xsy-colonne-mnemonique")
    const $selectColonneType = $("#schneider-generateur-xsy-colonne-type")
    const $selectColonneAdresse = $("#schneider-generateur-xsy-colonne-adresse")
    const $selectColonneCommentaire = $("#schneider-generateur-xsy-colonne-commentaire")
    const $btnExecuter = $("#schneider-generateur-xsy-executer-btn")
    const $textareaResultat = $("#schneider-generateur-xsy-resultat-textarea")

    const TYPES_ENTREES_SORTIES_TOR = ["E", "S"]
    const TYPES_ENTREES_SORTIES_ANA = ["EA", "SA"]
    const TYPES_ENTREES_SORTIES = [...TYPES_ENTREES_SORTIES_TOR, ...TYPES_ENTREES_SORTIES_ANA]
    const TYPES_RECONNUS = [...TYPES_ENTREES_SORTIES, "M", "MW", "BOOL", "INT"]
    const PREFIXES = {E: "IN", S: "OUT", EA: "EA", SA: "SA"}

    $btnFichierMnemoniques.on('click', async function(){
        const path = await ElectronUtils.openFile({filters: [{name: "Fichiers Excel (.xlsx, .xls)", extensions: ["xlsx", "xls"]}]})
        if(path) $inputFichierMnemoniques.val(path)
    }) 

    $btnFichierSortie.on('click', async function(){
        const path = await ElectronUtils.saveFile({filters: [{name: "Variables(.xsy)", extensions: ["xsy"]}]})
        if(path) $inputFichierSortie.val(path)
    }) 

    async function executer(){
        const fichierMnemoniques = $inputFichierMnemoniques.val()
        const feuilleFichierMnemoniques = parseInt($selectFeuilleFichierMnemoniques.val())
        const fichierSortie = $inputFichierSortie.val()
        const colonneMnemonique = mappingLettresColonnes[$selectColonneMnemonique.val()]
        const colonneType = mappingLettresColonnes[$selectColonneType.val()]
        const colonneAdresse = mappingLettresColonnes[$selectColonneAdresse.val()]
        const colonneCommentaire = mappingLettresColonnes[$selectColonneCommentaire.val()]
        const ajouterPrefixes = $checkAjouterPrefixes.prop("checked")
        $textareaResultat.addClass("d-none").removeClass("d-block")
        const champs = [fichierMnemoniques, fichierSortie, colonneMnemonique, colonneAdresse, colonneType, colonneCommentaire]
        if(champs.includes("") || champs.includes(undefined)){
            ToastifyUtils.error("Complétez tous les champs")
            return 
        }
        if(Array.from(new Set([colonneMnemonique, colonneType, colonneAdresse, colonneCommentaire])).length < 4){
            ToastifyUtils.error("Deux colonnes ont la même lettre")
            return
        }
        const contenuFichierMnemoniques = await MiscUtils.readExcelFile(fichierMnemoniques)
        if(!contenuFichierMnemoniques || contenuFichierMnemoniques.length == 0){
            ToastifyUtils.error("Le fichier mnémoniques est vide ou illisible")
            return
        }
        if(!(feuilleFichierMnemoniques in contenuFichierMnemoniques)){
            ToastifyUtils.error(`La feuille N° ${feuilleFichierMnemoniques+1} n'existe pas dans le fichier Excel`)
            return
        }
        const donneesEntree = contenuFichierMnemoniques[feuilleFichierMnemoniques].data.slice(1) //Première feuille, suppression de la première ligne qui est l'entête
        //Creation des objets pour le fichier xml
        const variables = []
        const erreurs = []
        for(const ligne of donneesEntree){
            let mnemonique = (ligne[colonneMnemonique] ?? "").trim()
            if(mnemonique == "") continue
            if(!/^[A-Za-z0-9_]+$/.test(mnemonique)){
                erreurs.push(`${mnemonique} : Le mnémonique contient un caractère invalide`)
                continue
            }
            let type = (ligne[colonneType] ?? "").trim().toUpperCase()
            if(type == ""){
                erreurs.push(`${mnemonique} : Aucun type défini`)
                continue
            } 
            if(!TYPES_RECONNUS.includes(type)){
                erreurs.push(`${mnemonique} : Le type '${type}' n'est pas reconnu`)
                continue
            }
            if(ajouterPrefixes && TYPES_ENTREES_SORTIES.includes(type)) mnemonique = PREFIXES[type] + "_"+mnemonique   
            let adresse = (ligne[colonneAdresse] ?? "").trim()
            if(adresse == ""){
                erreurs.push(`${mnemonique} : Aucune adresse définie`)
                continue
            } 
            if(!adresse.startsWith("%")) adresse = "%"+adresse
            const commentaire = (ligne[colonneCommentaire] ?? "").trim()
            
            if(mnemonique.length > 32){
                erreurs.push(`${mnemonique} : Longeur maximale mnémonique dépassée (32 caractères)`)
                continue
            }

            variables.push({
                "@name": mnemonique,
                "@typeName": TYPES_ENTREES_SORTIES_TOR.includes(type) 
                    ? "EBOOL" 
                    : (TYPES_ENTREES_SORTIES_ANA.includes(type)
                        ? "INT"
                        : (type == "M"
                            ? "EBOOL"
                            : (type == "MW"
                                ? "WORD"
                                : type
                            )
                        )
                    ),
                "@topologicalAddress": adresse,
                comment: {
                    "#text": commentaire
                }
            })
        }
        if(erreurs.length > 0){
            $textareaResultat.val(erreurs.join("\n"))
            $textareaResultat.addClass("d-block").removeClass("d-none")
            return
        }
        const xml = await MiscUtils.buildXML({
            VariablesExchangeFile: {
                dataBlock: {
                    variables
                }
            }
        })
        if(await MiscUtils.writeFile(fichierSortie, xml))
            ToastifyUtils.success("Fichier créé")
        else
            ToastifyUtils.error("Echec de la création du fichier")
    }

    $btnExecuter.on('click', async function(){
        startBtnLoading($btnExecuter)
        await executer()
        stopBtnLoading($btnExecuter)
    })
}

waitJQuery(schneiderGenerateurXSY)