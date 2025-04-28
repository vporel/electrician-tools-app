const simplificateurNomenclatureFichiersEntree = []
const simplificateurNomenclatureContenuDivFichiersEntree = []

function simplificateurNomenclatureSupprimerFichierEntree(path){
    const index = simplificateurNomenclatureFichiersEntree.indexOf(path)
    simplificateurNomenclatureFichiersEntree.splice(index, 1)
    simplificateurNomenclatureContenuDivFichiersEntree.splice(index, 1)
    $('#simplificateur-nomenclature-fichiers-entree-list').html(simplificateurNomenclatureContenuDivFichiersEntree.length > 0 ? simplificateurNomenclatureContenuDivFichiersEntree.join("") : "Ajoutez un/plusieurs fichier(s)")
}
function simplificateurNomenclature(){
    const $btnFichierEntree = $('#simplificateur-nomenclature-fichier-entree-btn')
    const $divFichiersEntree = $('#simplificateur-nomenclature-fichiers-entree-list')
    const $inputFichierSortie = $('#simplificateur-nomenclature-fichier-sortie')
    const $btnFichierSortie = $('#simplificateur-nomenclature-fichier-sortie-btn')
    const $selectColonneEtiquette = $('#simplificateur-nomenclature-colonne-etiquette')
    const $selectColonneDescription = $('#simplificateur-nomenclature-colonne-description')
    const $selectColonneId = $('#simplificateur-nomenclature-colonne-id')
    const $selectColonneFabricant = $('#simplificateur-nomenclature-colonne-fabricant')
    const $selectColonneQuantite = $('#simplificateur-nomenclature-colonne-quantite')
    const $selectProprieteTri = $('#simplificateur-nomenclature-propriete-tri')
    const $btnExecuter = $('#simplificateur-nomenclature-executer-btn')

    $btnFichierEntree.on('click', async function(){
        const paths = await ElectronUtils.openFiles({filters: [{name: "Fichiers Excel", extensions: ["xlsx", "xls"]}]})
        if(paths){
            paths.forEach(path => {
                if(!simplificateurNomenclatureFichiersEntree.includes(path)){
                    simplificateurNomenclatureFichiersEntree.push(path)
                    const codeElement = `
                        <div class="d-flex gap-2 align-items-center my-1">
                            ${path}
                            <button type="button" class="btn btn-secondary py-0 px-1" onclick="simplificateurNomenclatureSupprimerFichierEntree('${path}')"><i class="bi bi-x"></i></button>
                        </div>
                    `
                    simplificateurNomenclatureContenuDivFichiersEntree.push(codeElement)
                    $divFichiersEntree.html(simplificateurNomenclatureContenuDivFichiersEntree.join(""))
                }
            })
        }
    })  

    $btnFichierSortie.on('click', async function(){
        let path = await ElectronUtils.saveFile({filters: [{name: "Fichiers Excel", extensions: ["xlsx"]}]})
        if(!path.toLowerCase().endsWith('.xlsx')) path = path+".xlsx"
        if(path) $inputFichierSortie.val(path)
    })  

    $btnExecuter.on('click', async function(){
        startBtnLoading($btnExecuter)
        const fichierSortie = $inputFichierSortie.val()
        const mappingLettresColonnes = {A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6}
        const colonneEtiquetteIndice = mappingLettresColonnes[$selectColonneEtiquette.val()]
        const colonneDescriptionIndice = mappingLettresColonnes[$selectColonneDescription.val()]
        const colonneIdIndice = mappingLettresColonnes[$selectColonneId.val()]
        const colonneFabricantIndice = mappingLettresColonnes[$selectColonneFabricant.val()]
        const colonneQuantiteIndice = mappingLettresColonnes[$selectColonneQuantite.val()]
        const proprieteTri = $selectProprieteTri.val()
        if(simplificateurNomenclatureFichiersEntree.length == 0 || fichierSortie == ""){
            ToastifyUtils.error("Complétez tous les champs")
        }else{
            if(Array.from(new Set([colonneEtiquetteIndice, colonneDescriptionIndice, colonneIdIndice, colonneFabricantIndice, colonneQuantiteIndice])).length < 5){
                ToastifyUtils.error("Deux colonnes ont la même lettre")
            }else{
                let unFichierVide = false
                let donneesEntree = []
                for(const fichierEntree of simplificateurNomenclatureFichiersEntree){
                    const contenuFichierEntree = await MiscUtils.readExcelFile(fichierEntree)
                    if(!contenuFichierEntree || contenuFichierEntree.length == 0){
                        ToastifyUtils.error("Le fichier nomenclature est vide")
                        unFichierVide = true
                        break
                    }else{
                        donneesEntree = [...donneesEntree, ...(contenuFichierEntree[0].data.slice(1))] //Première feuille, suppression de la première ligne qui est l'entête
                    }
                }
                if(!unFichierVide){
                    /**
                     * @var Array<{
                     *  id: string
                     *  quantite: number
                     *  description: string
                     *  fabricant: string
                     *  symboles: string[]
                     * }>
                     */
                    const references = []

                    for(const ligne of donneesEntree){
                        let id = ligne[colonneIdIndice]
                        if(!id || id == "") continue
                        id = id.toUpperCase()
                        const etiquette = ligne[colonneEtiquetteIndice]
                        const description = ligne[colonneDescriptionIndice]
                        const fabricant = ligne[colonneFabricantIndice]
                        const quantite = parseInt(ligne[colonneQuantiteIndice] ?? 1)
                        const referenceExistante = references.find(r => r.id == id)
                        if(referenceExistante){
                            referenceExistante.quantite = referenceExistante.quantite + quantite
                            referenceExistante.symboles.push(`${etiquette} (${quantite})`)
                        }else{
                            const ref = {
                                id, description, fabricant, quantite,
                                symboles: [`${etiquette} (${quantite})`]
                            }
                            references.push(ref)
                        }
                    }
                    const donneesSorties = [
                        ["ID CATALOGUE", "QTE", "DESCRIPTION", "FABRICANT", "SYMBOLES"]
                    ]
                    const hauteursLignes = []
                    for(const ref of references.sort((r1, r2) => (r1[proprieteTri] ?? "").localeCompare(r2[proprieteTri] ?? ""))){
                        hauteursLignes.push(20) //On définit la même hauteur pour toutes les lignes
                        donneesSorties.push([
                            ref.id,
                            ref.quantite,
                            ref.description,
                            ref.fabricant,
                            ref.symboles.join(", ")
                        ])
                    }
                    if(await MiscUtils.writeExcelFile(
                        fichierSortie,
                        [{name: "Nomenclature", data: donneesSorties}], 
                        {
                            columnsWidths: [20, 5, 100, 30, 100],
                            rowsHeights: hauteursLignes
                        }
                    ))
                        ToastifyUtils.success("Fichier généré")
                    else
                        ToastifyUtils.error("Erreur lors de la création du fichier")
                }
            }
        }
        stopBtnLoading($btnExecuter)
    })
}

waitJQuery(simplificateurNomenclature)