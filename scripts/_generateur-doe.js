const SETTING_GENERATEUR_DOE_DOSSIER_BD = "generateur-doe.dossier-bd"
const SETTING_GENERATEUR_DOE_ENREGISTRER_DOSSIER_BD = "generateur-doe.enregistrer-dossier-bd"

function generateurDOE(){
    const $dossierDB = $("#generateur-doe-dossier-bd")
    const $btnDossierBD = $("#generateur-doe-dossier-bd-btn")
    const $checkEnregistrerDossierBD = $("#generateur-doe-enregistrer-dossier-db")
    const $dossierSortie = $("#generateur-doe-dossier-sortie")
    const $btnDossierSortie = $("#generateur-doe-dossier-sortie-btn")
    const $fichierNomenclature = $("#generateur-doe-fichier-nomenclature")
    const $btnFichierNomenclature = $("#generateur-doe-fichier-nomenclature-btn")
    const $colonneReferences = $("#generateur-doe-colonne-references")
    const $btnGenerer = $("#generateur-doe-colonne-generer-btn")
    const $divResultat = $("#generateur-doe-resultat")
    const $nbRefsNonTrouvees = $("#generateur-doe-nb-refs-non-trouvees")
    const $resultatTextarea = $("#generateur-doe-resultat-textarea")
    const $spanProgression = $("#generateur-doe-progression")
    
    async function chargerParametres(){
        const dossierBD = await SettingsUtils.get(SETTING_GENERATEUR_DOE_DOSSIER_BD)
        if(dossierBD) $dossierDB.val(dossierBD)
        const enregistrerDossierBD = await SettingsUtils.get(SETTING_GENERATEUR_DOE_ENREGISTRER_DOSSIER_BD)
        if(enregistrerDossierBD) $checkEnregistrerDossierBD.prop("checked", true)
    }
    chargerParametres()

    async function enregistrerDossierBD(){
        if($dossierDB.val() != "") await SettingsUtils.set(SETTING_GENERATEUR_DOE_DOSSIER_BD, $dossierDB.val())
    }
    
    async function oublierDossierBD(){
        await SettingsUtils.set(SETTING_GENERATEUR_DOE_DOSSIER_BD, null)
    }
    

    $btnDossierBD.on('click', async function(){
        const path = await ElectronUtils.openDirectory()
        if(path){ 
            $dossierDB.val(path)
            if($checkEnregistrerDossierBD.prop("checked")) enregistrerDossierBD()
            else oublierDossierBD()
        }
    })  

    $checkEnregistrerDossierBD.on('change', function(){
        if($checkEnregistrerDossierBD.prop("checked")) enregistrerDossierBD()
        else oublierDossierBD()
        SettingsUtils.set(SETTING_GENERATEUR_DOE_ENREGISTRER_DOSSIER_BD, $checkEnregistrerDossierBD.prop("checked"))
    })

    $btnDossierSortie.on('click', async function(){
        const path = await ElectronUtils.openDirectory()
        if(path){
            if(path != $dossierDB.val()) $dossierSortie.val(path)
            else alert("Le dossier de sortie doit être différent du dossier base de données")
        }
    })  

    $btnFichierNomenclature.on('click', async function(){
        const path = await ElectronUtils.openFile({filters: [{name: "Fichiers Excel", extensions: ["xlsx", "xls"]}]})
        if(path) $fichierNomenclature.val(path)
    }) 

    $btnGenerer.on('click', async function(){
        const dossierBD = $dossierDB.val()
        const dossierSortie = $dossierSortie.val()
        const fichierNomenclature = $fichierNomenclature.val()
        const mappingLettresColonnes = {A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6}
        const colonneReferencesIndice = mappingLettresColonnes[$colonneReferences.val()]
        startBtnLoading($btnGenerer)
        $divResultat.addClass("d-none").removeClass("d-block")
        $spanProgression.text("")
        if(dossierBD == "" || dossierSortie == "" || fichierNomenclature == "")
            ToastifyUtils.error("Complétez tous les champs")
        else{
            const fichiersDB = await SystemUtils.getAllFilesPath(dossierBD)
            const contenuFichierExcel = await MiscUtils.readExcelFile(fichierNomenclature)
            if(!contenuFichierExcel || contenuFichierExcel.length == 0)
                ToastifyUtils.error("Le fichier nomenclature est vide")
            else{
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
                    for(cheminFichier of fichiersDB){
                        nomBaseFichier = (await SystemUtils.path.basename(cheminFichier)).toUpperCase()
                        if(
                            nomBaseFichier.indexOf(ref) != -1 || 
                            nomBaseFichier.indexOf(ref.replaceAll(" ", "")) != -1 || 
                            nomBaseFichier.indexOf(ref.replaceAll("/", "-")) != -1 || 
                            nomBaseFichier.indexOf(ref.replaceAll("-", " ")) != -1 || 
                            nomBaseFichier.indexOf(ref.replaceAll("-", "")) != -1
                        ){
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
        }
        stopBtnLoading($btnGenerer)
    })
}

waitJQuery(generateurDOE)