
function generateurDOE(){
    const $dossierSortie = $("#generateur-doe-dossier-sortie")
    const $btnDossierSortie = $("#generateur-doe-dossier-sortie-btn")
    const $fichierNomenclature = $("#generateur-doe-fichier-nomenclature")
    const $btnFichierNomenclature = $("#generateur-doe-fichier-nomenclature-btn")
    const $colonneReferences = $("#generateur-doe-colonne-references")
    const $btnGenerer = $("#generateur-doe-generer-btn")
    const $divResultat = $("#generateur-doe-resultat")
    const $nbRefsNonTrouvees = $("#generateur-doe-nb-refs-non-trouvees")
    const $resultatTextarea = $("#generateur-doe-resultat-textarea")
    const $spanProgression = $("#generateur-doe-progression")

    $btnDossierSortie.on('click', async function(){
        const path = await ElectronUtils.openDirectory()
        if(path){
            if(path != await lireParametre(PARAMETRE_DOSSIER_BD_MATERIELS)) $dossierSortie.val(path)
            else alert("Le dossier de sortie doit être différent du dossier base de données")
        }
    })  

    $btnFichierNomenclature.on('click', async function(){
        const path = await ElectronUtils.openFile({filters: [{name: "Fichiers Excel", extensions: ["xlsx", "xls"]}]})
        if(path) $fichierNomenclature.val(path)
    }) 

    async function executer(){
        const dossierBD = await lireParametre(PARAMETRE_DOSSIER_BD_MATERIELS)
        const dossierSortie = $dossierSortie.val()
        const fichierNomenclature = $fichierNomenclature.val()
        const mappingLettresColonnes = {A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6}
        const colonneReferencesIndice = mappingLettresColonnes[$colonneReferences.val()]
        $divResultat.addClass("d-none").removeClass("d-block")
        $spanProgression.text("")
        if(!dossierBD || dossierBD == ""){
            ToastifyUtils.error("Paramétrez le dossier base de documents")
            return
        }
        if(dossierSortie == "" || fichierNomenclature == ""){
            ToastifyUtils.error("Complétez tous les champs")
            return
        }
        const fichiersDB = await SystemUtils.getAllFilesPath(dossierBD)
        const contenuFichierExcel = await MiscUtils.readExcelFile(fichierNomenclature)
        if(!contenuFichierExcel || contenuFichierExcel.length == 0){
            ToastifyUtils.error("Le fichier nomenclature est vide")
            return
        }
        const refsTrouvees = []
        const refsNonTrouvees = []
        const donnees = contenuFichierExcel[0].data.slice(1) //Première feuille, supprimer la première ligne qui est l'entête
        //Première feuille
        for(let i = 0; i < donnees.length; i++){
            const ligne = donnees[i];
            //Vérifier que la ligne a assez d'éléments
            if(ligne.length < (colonneReferencesIndice + 1)) continue
            let ref = ligne[colonneReferencesIndice]
            if(!ref || ref == "") continue
            ref = ref.toUpperCase()
            if(refsTrouvees.includes(ref)) continue
            let refTrouvee = false
            for(const cheminFichier of fichiersDB){
                const nomBaseFichier = (await SystemUtils.path.basename(cheminFichier)).toUpperCase()
                if(testNomFichierReference(nomBaseFichier, ref)){
                    // Chemin du dossier dans le DOE généré
                    const dossierDestination = dossierSortie + "/" + (await SystemUtils.path.basename(await SystemUtils.path.dirname(cheminFichier)))
                    // Création du dossier s'il n'existe pas
                    if(
                        await SystemUtils.fs.exists(dossierDestination) ||
                        await SystemUtils.fs.mkdir(dossierDestination)
                    ){
                        // Copie du fichier s'il n'existe pas déjà
                        const cheminDestination = dossierDestination + "/" + nomBaseFichier
                        if(!(await SystemUtils.fs.exists(cheminDestination))){
                            if(await SystemUtils.fs.copyFile(cheminFichier, cheminDestination)){
                                refsTrouvees.push(ref)
                                refTrouvee = true
                            }
                        }else
                            refTrouvee = true
                    }
                }
            }
            if(!refTrouvee && !refsNonTrouvees.includes(ref))
                refsNonTrouvees.push(ref)
            $spanProgression.text(`${i+1} / ${donnees.length} lignes`)
        }
        ToastifyUtils.success("Génération terminée")
        $nbRefsNonTrouvees.text(refsNonTrouvees.length)
        $resultatTextarea.val(refsNonTrouvees.join("\n"))
        $divResultat.addClass("d-block").removeClass("d-none")
    }

    $btnGenerer.on('click', async function(){
        startBtnLoading($btnGenerer)
        await executer()
        stopBtnLoading($btnGenerer)
    })
}

waitJQuery(generateurDOE)