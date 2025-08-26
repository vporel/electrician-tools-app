/*
    Rechercher une datasheet dans la base de fichiers
*/

function rechercherDatasheet(){
    const $inputRef = $('#rechercher-document-ref')
    const $selectType = $('#rechercher-document-type')
    const $selectLang = $('#rechercher-document-lang')
    const $btnRechercher = $('#rechercher-document-btn')
    const $divCheminFichier = $('#rechercher-document-chemin-fichier')

    async function executer(){
        const dossierBD = await lireParametre(PARAMETRE_DOSSIER_BD_MATERIELS)
        const ref = $inputRef.val().toString().trim()
        const type = $selectType.val().toUpperCase()
        const lang = $selectLang.val().toUpperCase()
        if(ref == ""){
            ToastifyUtils.error("Entrer une référence")
            return
        }
        if(!dossierBD || dossierBD == ""){
            ToastifyUtils.error("Paramétrez le dossier base de documents")
            return
        }
        const fichiersDB = await SystemUtils.getAllFilesPath(dossierBD)
        const correspondances = []
        for(cheminFichier of fichiersDB){
            nomBaseFichier = (await SystemUtils.path.basename(cheminFichier)).toUpperCase()
            if(testNomFichierReference(nomBaseFichier, ref)){
                if(type != "" && nomBaseFichier.includes(type+"_"+lang)){
                    await MiscUtils.startFile(cheminFichier)
                    return
                }
                correspondances.push(cheminFichier)
            }
        }
        if(correspondances.length > 0){
            if(type != "") ToastifyUtils.error(`Correspondance exacte en '_${type}_${lang}' non trouvée`)
            $divCheminFichier.html(
                correspondances.map(chemin => {
                    const cheminNettoye = chemin.replaceAll("\\", "/").replaceAll("//", "/") //Nettoyage pour que le chemin s'insère en attribut HTML
                    return `
                        <div class="d-flex align-items-center py-1 gap-1" style="border-bottom: 1px solid rgba(0, 0, 0, .05)">
                            <span style="font-size: 13px; flex: 1;">${chemin}</span>
                            <button type="button" class="btn btn-secondary py-0 px-1" onclick="MiscUtils.startFile('${cheminNettoye}')">Ouvrir</button>
                            <button type="button" class="btn btn-secondary py-0 px-1" onclick="MiscUtils.openDirAndSelectFile('${cheminNettoye}')">Ouvrir le dossier</button>
                        </div>
                    `
                }).join("")
            ).addClass("d-block").removeClass("d-none")
        }else{
            ToastifyUtils.error("Aucun fichier trouvé")
            $divCheminFichier.html("").addClass("d-none").removeClass("d-block")
        }
    }

    async function surCllicBouton(){
        startBtnLoading($btnRechercher)
        await executer()
        stopBtnLoading($btnRechercher)
    }

    $inputRef.on('keypress', async function(e){
        if(e.which == 13) surCllicBouton() 
    })

    $btnRechercher.on('click', surCllicBouton)
}

waitJQuery(rechercherDatasheet)