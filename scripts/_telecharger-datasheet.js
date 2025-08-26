/*
    Télécharger la doc technique d'une référence
    Le fichier téléchargé est mis dans le dossier Téléchargements
    Après analyse des urls de téléchargements sur certains sites, je me suis rendu compte que le pattern est toujours le même
    La seule chaine qui change est la référence. 
    Il est donc possible de télécharger une doc à partir de ce script sans aller sur le site
*/

/**
 * 
 * @param {*} $inputRef 
 * @param {*} $selectLang 
 * @param {*} $btnTelecharger 
 * @param {*} $checkOuvrirApresTelechargement 
 * @param {(ref, lang) => string} patternUrl 
 */
function telechargerDatasheet($inputRef, $selectLang, $btnTelecharger, patternUrl){
    const $checkOuvrirApresTelechargement = $('#telecharger-datasheet-ouvrir-apres-telechargement')
    async function executer(){
        const ref = $inputRef.val().toString().trim()
        const lang = $selectLang.val()
        if(ref != "" && ref.length > 5){
            const filePath = await MiscUtils.downloadFile(
                patternUrl(ref, lang), 
                ref+"_DATASHEET_"+lang+".pdf",
                {
                    contentType: "application/pdf"
                }
            )
            if(filePath){
                ToastifyUtils.success("Fichier téléchargé")
                if($checkOuvrirApresTelechargement.prop("checked")) MiscUtils.startFile(filePath)
            }else ToastifyUtils.error("Echec du téléchargement")
        }else{
            ToastifyUtils.error("Référence invalide")
        }
    }  

    async function surCllicBouton(){
        startBtnLoading($btnTelecharger)
        await executer()
        stopBtnLoading($btnTelecharger)
    }     

    $inputRef.on('keypress', async function(e){
        if(e.which == 13) surCllicBouton() 
    })

    $btnTelecharger.on('click', surCllicBouton)
}

const patternsUrlsDatasheets = {
    harting: (ref, lang) => "https://b2b.harting.com/files/download/PRD/PDF_DS/PDF_DS_"+ref+"_"+lang+".pdf",
    siemens: (ref, lang) => "https://mall.industry.siemens.com/teddatasheet/?format=PDF&caller=Mall&mlfbs="+ref+"&language="+lang.toLowerCase(),
    teknomega: (ref, lang) => "https://www.teknomega.it/wp-content/uploads/schedetecniche/"+ref+".pdf"
}

waitJQuery(() => {
    for(const fabricant in patternsUrlsDatasheets){
        telechargerDatasheet(
            $(`#telecharger-datasheet-${fabricant}-ref`),
            $(`#telecharger-datasheet-${fabricant}-lang`),
            $(`#telecharger-datasheet-${fabricant}-btn`),     
            patternsUrlsDatasheets[fabricant]
        )  
    }
})