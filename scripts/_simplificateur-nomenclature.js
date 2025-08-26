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
    const $selectFiltre1Colonne = $('#simplificateur-nomenclature-filtre-1-colonne')
    const $inputFiltre1Valeurs = $('#simplificateur-nomenclature-filtre-1-valeurs')
    const $selectFiltre2Colonne = $('#simplificateur-nomenclature-filtre-2-colonne')
    const $inputFiltre2Valeurs = $('#simplificateur-nomenclature-filtre-2-valeurs')
    const $selectGroupeColonne = $('#simplificateur-nomenclature-groupe-colonne')
    const $btnExecuter = $('#simplificateur-nomenclature-executer-btn')

    $btnFichierEntree.on('click', async function(){
        const paths = await ElectronUtils.openFiles({filters: [{name: "Fichiers Excel", extensions: ["xlsx", "xls", "xlsm"]}]})
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
        if(!path) return
        if(!path.toLowerCase().endsWith('.xlsx')) path = path+".xlsx"
        $inputFichierSortie.val(path)
    })  

    async function executer(){
        const fichierSortie = $inputFichierSortie.val()
        const colonneEtiquetteIndice = mappingLettresColonnes[$selectColonneEtiquette.val()]
        const colonneDescriptionIndice = mappingLettresColonnes[$selectColonneDescription.val()]
        const colonneIdIndice = mappingLettresColonnes[$selectColonneId.val()]
        const colonneFabricantIndice = mappingLettresColonnes[$selectColonneFabricant.val()]
        const colonneQuantiteIndice = mappingLettresColonnes[$selectColonneQuantite.val()]
        const proprieteTri = $selectProprieteTri.val()
        const filtre1Colonne = $selectFiltre1Colonne.val() != "" ? mappingLettresColonnes[$selectFiltre1Colonne.val()] : ""
        const filtre1Valeurs = $inputFiltre1Valeurs.val().trim()
        const filtre2Colonne = $selectFiltre2Colonne.val() != "" ? mappingLettresColonnes[$selectFiltre2Colonne.val()] : ""
        const filtre2Valeurs = $inputFiltre2Valeurs.val().trim()
        const groupeColonne = $selectGroupeColonne.val() != "" ? mappingLettresColonnes[$selectGroupeColonne.val()] : ""
        if(simplificateurNomenclatureFichiersEntree.length == 0 || fichierSortie == ""){
            ToastifyUtils.error("Complétez tous les champs")
            return
        }
        if(Array.from(new Set([colonneEtiquetteIndice, colonneDescriptionIndice, colonneIdIndice, colonneFabricantIndice, colonneQuantiteIndice])).length < 5){
            ToastifyUtils.error("Deux colonnes ont la même lettre")
            return
        }
        if(filtre1Colonne !== "" && filtre1Valeurs == ""){
            ToastifyUtils.error("Aucune valeur définie pour le filtre 1")
            return
        }
        if(filtre2Colonne !== "" && filtre2Valeurs == ""){
            ToastifyUtils.error("Aucune valeur définie pour le filtre 2")
            return
        }
        let donneesEntree = []
        for(const fichierEntree of simplificateurNomenclatureFichiersEntree){
            const contenuFichierEntree = await MiscUtils.readExcelFile(fichierEntree)
            if(!contenuFichierEntree || contenuFichierEntree.length == 0){
                ToastifyUtils.error("Le fichier nomenclature est vide")
                return
            }else{
                donneesEntree = [...donneesEntree, ...(contenuFichierEntree[0].data.slice(1))] //Première feuille, suppression de la première ligne qui est l'entête
            }
        }
        /**
         * @var Array<{
         *  id: string
         *  quantite: number
         *  description: string
         *  fabricant: string
         *  symboles: string[]
         * }>
         */
        const references = {}

        for(const ligne of donneesEntree){
            //Filtrage
            if(filtre1Colonne !== ""){
                if(!ligne[filtre1Colonne] || !filtre1Valeurs.split(",").map(v => v.trim().toLowerCase()).includes(ligne[filtre1Colonne].trim().toLowerCase()))
                    continue
            }
            if(filtre2Colonne !== ""){
                if(!ligne[filtre2Colonne] || !filtre2Valeurs.split(",").map(v => v.trim().toLowerCase()).includes(ligne[filtre2Colonne].trim().toLowerCase()))
                    continue
            }

            //Sauvegarde données
            let id = ligne[colonneIdIndice]
            if(!id) continue
            id = id+"" //Convertir en chaine de caractères
            if(id == "") continue 
            id = id.toUpperCase()
            const etiquette = ligne[colonneEtiquetteIndice] ?? ""
            const description = ligne[colonneDescriptionIndice]
            const fabricant = ligne[colonneFabricantIndice]
            let quantite = parseInt(ligne[colonneQuantiteIndice] ?? 1)
            if(isNaN(quantite)) quantite = 0
            let groupe = groupeColonne !== "" ? (ligne[groupeColonne] ?? "") : ""
            if(!references[groupe]) references[groupe] = []
            const referenceExistante = references[groupe].find(r => r.id == id)
            if(referenceExistante){
                referenceExistante.quantite = referenceExistante.quantite + quantite
                referenceExistante.symboles.push(`${etiquette} (${quantite})`)
            }else{
                const ref = {
                    id, description, fabricant, quantite,
                    symboles: [`${etiquette} (${quantite})`]
                }
                references[groupe].push(ref)
            }
            
        }
        const entete = ["ID CATALOGUE", "QTE", "DESCRIPTION", "FABRICANT", "SYMBOLES"]

        const donneesSorties = []
        if(filtre1Colonne !== "") donneesSorties.push(["Filtre 1 : " + filtre1Valeurs])
        if(filtre2Colonne !== "") donneesSorties.push(["Filtre 2 : " + filtre2Valeurs])
        donneesSorties.push(entete)
        const hauteursLignes = []
        for(const groupe in references){
            if(groupeColonne !== "") donneesSorties.push([], ["Groupe : " + groupe])
            for(const ref of references[groupe].sort((r1, r2) => ((r1[proprieteTri] ?? "")+"").localeCompare((r2[proprieteTri] ?? "")+""))){
                hauteursLignes.push(20) //On définit la même hauteur pour toutes les lignes
                const sortie = [
                    ref.id,
                    ref.quantite,
                    ref.description,
                    ref.fabricant,
                    ref.symboles.join(", ")
                ]
                donneesSorties.push(sortie)
            }
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

    $btnExecuter.on('click', async function(){
        startBtnLoading($btnExecuter)
        await executer()
        stopBtnLoading($btnExecuter)
    })
}

waitJQuery(simplificateurNomenclature)