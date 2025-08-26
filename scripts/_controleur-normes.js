const controleurNormesFichiersSelectionnes = []
const controleurNormesContenuDivFichiersSelectionnes = []

function controleurNormesSupprimerFichierEntree(path){
    const index = controleurNormesFichiersSelectionnes.indexOf(path)
    controleurNormesFichiersSelectionnes.splice(index, 1)
    controleurNormesContenuDivFichiersSelectionnes.splice(index, 1)
    $('#controleur-normes-fichiers-selectionnes-div').html(controleurNormesContenuDivFichiersSelectionnes.length > 0 ? controleurNormesContenuDivFichiersSelectionnes.join("") : "Ajoutez un/plusieurs fichier(s)")
}

function controleurNormes(){
    const $btnSelectionnerFichiers = $("#controleur-normes-selectionner-fichiers-btn")
    const $btnFichiersToutEffacer = $("#controleur-normes-fichiers-tout-effacer-btn")
    const $fichiersSelectionnesDiv = $("#controleur-normes-fichiers-selectionnes-div")
    const $dossierEntreeInput = $("#controleur-normes-dossier-entree-input")
    const $dossierEntreeBtn = $("#controleur-normes-dossier-entree-btn")
    const $dossierEntreeEffacerBtn = $("#controleur-normes-dossier-entree-effacer-btn")
    const $normesTextarea = $("#controleur-normes-normes-textarea")
    const $progressionSpan = $("#controleur-normes-progression-span")
    const $btnExecuter = $("#controleur-normes-executer-btn")
    const $resultatsPositifsContainerDiv = $("#controleur-normes-resultats-positifs-container-div")
    const $nbResultatsPositifsSpan = $("#controleur-normes-nb-resultats-positifs-span")
    const $resultatsPositifsDiv = $("#controleur-normes-resultats-positifs-div")
    const $resultatsPositifsExporterBtn = $("#controleur-normes-resultats-positifs-exporter-btn")
    const $resultatsPositifsCopierBtn = $("#controleur-normes-resultats-positifs-copier-btn")
    const $resultatsNegatifsContainerDiv = $("#controleur-normes-resultats-negatifs-container-div")
    const $nbResultatsNegatifsSpan = $("#controleur-normes-nb-resultats-negatifs-span")
    const $resultatsNegatifsDiv = $("#controleur-normes-resultats-negatifs-div")
    const $resultatsNegatifsExporterBtn = $("#controleur-normes-resultats-negatifs-exporter-btn")
    const resultatsPositifs = []
    const resultatsNegatifs = []

    $btnSelectionnerFichiers.on('click', async function(){
        const paths = await ElectronUtils.openFiles({filters: [{name: "Fichiers Excel", extensions: ["pdf"]}]})
        if(paths){
            paths.forEach(path => {
                if(!controleurNormesFichiersSelectionnes.includes(path)){
                    controleurNormesFichiersSelectionnes.push(path)
                    const codeElement = `
                        <div class="d-flex gap-2 align-items-center my-1">
                            ${path}
                            <button type="button" class="btn btn-secondary py-0 px-1" onclick="controleurNormesSupprimerFichierEntree('${path}')"><i class="bi bi-x"></i></button>
                        </div>
                    `
                    controleurNormesContenuDivFichiersSelectionnes.push(codeElement)
                    $fichiersSelectionnesDiv.html(controleurNormesContenuDivFichiersSelectionnes.join(""))
                }
            })
        }
    })  

    $btnFichiersToutEffacer.on('click', async function(){
        controleurNormesContenuDivFichiersSelectionnes.length = 0
        $fichiersSelectionnesDiv.html("Ajoutez un/plusieurs fichier(s)")
    }) 

    $dossierEntreeBtn.on('click', async function(){
        const path = await ElectronUtils.openDirectory()
        if(path) $dossierEntreeInput.val(path)
    }) 
    $dossierEntreeEffacerBtn.on('click', async function(){
        $dossierEntreeInput.val("")
    }) 

    $resultatsPositifsExporterBtn.on('click', async function(){
        if(resultatsPositifs.length == 0){
            ToastifyUtils.warning("La liste est vide")
            return
        }
        let fichierSortie = await ElectronUtils.saveFile({filters: [{name: "Fichiers Excel", extensions: ["xlsx"]}]})
        if(!fichierSortie) return
        if(!fichierSortie.toLowerCase().endsWith('.xlsx')) fichierSortie = fichierSortie+".xlsx"
        const entete = ["REFERENCE", "FABRICANT", "NORMES"]
        const largeursColonnes = [30, 20, 80]
        const hauteursLignes = []
        const donneesSortie = []
        for(const resultat of resultatsPositifs){
            hauteursLignes.push(20) //On définit la même hauteur pour toutes les lignes
            donneesSortie.push([resultat.reference, resultat.fabricant, resultat.normes.join(", ")])
        }
        if(await MiscUtils.writeExcelFile(
            fichierSortie,
            [{name: "Nomenclature", data: [entete, ...donneesSortie.sort((r1, r2) => r1[0].localeCompare(r2[0]))]}], //Exportation avec tri par référence
            {
                columnsWidths: largeursColonnes,
                rowsHeights: hauteursLignes
            }
        ))
            ToastifyUtils.success("Exportation terminée")
        else
            ToastifyUtils.error("Erreur lors de la création du fichier")
    })

    $resultatsPositifsCopierBtn.on('click', async function(){
        if(resultatsPositifs.length == 0){
            ToastifyUtils.warning("La liste est vide")
            return
        }
        startBtnLoading($btnExecuter)
        const dossierSortie = await ElectronUtils.openDirectory()
        if(dossierSortie){
            for(const resultat of resultatsPositifs){
                const nomBaseFichier = (await SystemUtils.path.basename(resultat.chemin)).toUpperCase()
                if(testNomFichierReference(nomBaseFichier, resultat.reference)){
                    // Chemin du dossier dans lequel placer le fichier
                    const dossierDestinationFichier = dossierSortie + "/" + (await SystemUtils.path.basename(await SystemUtils.path.dirname(resultat.chemin)))
                    // Création du dossier s'il n'existe pas
                    if(
                        await SystemUtils.fs.exists(dossierDestinationFichier) ||
                        await SystemUtils.fs.mkdir(dossierDestinationFichier)
                    ){
                        // Copie du fichier s'il n'existe pas déjà
                        const cheminDestinationFichier = dossierDestinationFichier + "/" + nomBaseFichier
                        if(!(await SystemUtils.fs.exists(cheminDestinationFichier))){
                            await SystemUtils.fs.copyFile(resultat.chemin, cheminDestinationFichier)
                        }
                    }
                }
            }
            ToastifyUtils.success("Fichiers copiés")
        }
        stopBtnLoading($btnExecuter)
    })

    $resultatsNegatifsExporterBtn.on('click', async function(){
        if(resultatsPositifs.length == 0){
            ToastifyUtils.warning("La liste est vide")
            return
        }
        let fichierSortie = await ElectronUtils.saveFile({filters: [{name: "Fichiers Excel", extensions: ["xlsx"]}]})
        if(!fichierSortie) return
        if(!fichierSortie.toLowerCase().endsWith('.xlsx')) fichierSortie = fichierSortie+".xlsx"
        const entete = ["REFERENCE", "FABRICANT", "COMMENTAIRE"]
        const largeursColonnes = [30, 20, 80]
        const hauteursLignes = []
        const donneesSortie = []
        for(const resultat of resultatsNegatifs.filter(r => r.reference != "")){
            if(donneesSortie.find(d => d[0] == resultat.reference)) continue //Supprimer les doublons de références
            hauteursLignes.push(20) //On définit la même hauteur pour toutes les lignes
            donneesSortie.push([resultat.reference, resultat.fabricant, ""])
        }
        if(await MiscUtils.writeExcelFile(
            fichierSortie,
            [{name: "Nomenclature", data: [entete, ...donneesSortie.sort((r1, r2) => r1[0].localeCompare(r2[0]))]}], //Exportation avec tri par référence
            {
                columnsWidths: largeursColonnes,
                rowsHeights: hauteursLignes
            }
        ))
            ToastifyUtils.success("Exportation terminée")
        else
            ToastifyUtils.error("Erreur lors de la création du fichier")
    })

    async function executer(){
        const dossierEntree = $dossierEntreeInput.val().trim()
        let cheminsDansDossier = []
        if(dossierEntree != "") cheminsDansDossier = await SystemUtils.getAllFilesPath(dossierEntree)
        const chemins = [...controleurNormesFichiersSelectionnes, ...cheminsDansDossier]
        const normes = $normesTextarea.val().split("\n")
        resultatsPositifs.length = 0
        resultatsNegatifs.length = 0
        $progressionSpan.text("")
        $resultatsPositifsContainerDiv.addClass("d-none").removeClass("d-block")
        $resultatsNegatifsContainerDiv.addClass("d-none").removeClass("d-block")
        for(let i = 0; i < chemins.length; i++){
            $progressionSpan.text(`${i+1} / ${chemins.length} fichiers`)
            let chemin = chemins[i]
            chemin = chemin.trim()
            if(chemin == "") continue
            const reference = extraireReference(chemin)
            const resultat = {reference, chemin, nomFichier: extraireNomFichier(chemin), fabricant: extraireFabricant(chemin)}
            if(reference == ""){
                resultatsNegatifs.push({...resultat, message: "ne représente pas une référence"})
                continue
            }
            if(resultatsPositifs.find(r => r.reference == reference)) continue //Des normes ont déjà été trouvées pour cette référence
            if(!chemin.toUpperCase().endsWith("PDF")){
                resultatsNegatifs.push({...resultat, message: "n'est pas un pdf"})
                continue
            }
            const texte = await MiscUtils.getTextsFromPdf(chemin)
            if(!texte)
            if(!chemin.toUpperCase().endsWith("PDF")){
                resultatsNegatifs.push({...resultat, message: "echec de la lecture"})
                continue
            }
            const texteMaj = texte.toUpperCase()
            //Recherche des normes
            const normesTrouvees = []
            for(let n of normes){
                n = n.trim()
                if(n == "") continue 
                if(texteMaj.includes(n.toUpperCase())) normesTrouvees.push(n)
            }
            if(normesTrouvees.length == 0)resultatsNegatifs.push({...resultat, message: "aucune norme trouvée"})
            else{
                resultatsPositifs.push({...resultat, normes: normesTrouvees})
                const indexEnNegatifs = resultatsNegatifs.findIndex(r => r.reference == reference) //Vérifier si la référence a déjà été enregistrée dans les résultats négatifs
                if(indexEnNegatifs != -1){ //Des normes viennent d'être trouvée mais dans une précédente itération, la référence a été enregistrée en résultat négatif
                    //Suppression de la référence du tableau des résultats négatifs
                    resultatsNegatifs.splice(indexEnNegatifs, 1)
                }
            }
        }
        ToastifyUtils.success("Traitement terminé")
        $nbResultatsPositifsSpan.text(resultatsPositifs.length)
        $resultatsPositifsDiv.find("tbody").html(
            resultatsPositifs.map(resultat => `
                <tr class="py-1" style="border-bottom: 1px solid rgba(0, 0, 0, .05)">
                    <td class="fw-bold">${resultat.reference}</td>
                    <td>${resultat.fabricant}</td>
                    <td>${resultat.nomFichier}</td>
                    <td>${resultat.normes.join(", ")}</td>
                    <td class="text-center"><button type="button" class="btn btn-secondary py-0 px-1" onclick="MiscUtils.startFile('${resultat.chemin.replaceAll("\\", "/").replaceAll("//", "/")}')">Ouvrir</button></td>
                </tr>
            `).join("")
        )
        $resultatsPositifsContainerDiv.addClass("d-block").removeClass("d-none")
        $nbResultatsNegatifsSpan.text(resultatsNegatifs.length)
        $resultatsNegatifsDiv.find("tbody").html(
            resultatsNegatifs.map(resultat => `
                <tr class="py-1" style="border-bottom: 1px solid rgba(0, 0, 0, .05)">
                    <td class="fw-bold">${resultat.reference}</td>
                    <td>${resultat.fabricant}</td>
                    <td>${resultat.nomFichier}</td>
                    <td>${resultat.message}</td>
                    <td class="text-center"><button type="button" class="btn btn-secondary py-0 px-1" onclick="MiscUtils.startFile('${resultat.chemin.replaceAll("\\", "/").replaceAll("//", "/")}')">Ouvrir</button></td>
                </tr>
            `).join("")
        )
        $resultatsNegatifsContainerDiv.addClass("d-block").removeClass("d-none")
        $('html').scrollTop($('html').height())
    }

    $btnExecuter.on('click', async function(){
        startBtnLoading($btnExecuter)
        await executer()
        stopBtnLoading($btnExecuter)
    })
}

waitJQuery(controleurNormes)