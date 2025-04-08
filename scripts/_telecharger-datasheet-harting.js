/*
    Télécharger la doc technique d'une référence harting
    Le fichier téléchargé est mis dans le dossier Téléchargements
    Après analyse des urls de téléchargements sur le site harting, je me suis rendu compte que le pattern est toujours le même
    La seule chaine qui change est la référence. 
    Il est donc possible de télécharger une doc à partir de ce script sans aller sur le site
*/
function telechargerDatasheetHarting(){
    const $inputRef = $('#telecharger-datasheet-harting-ref')
    const $selectLang = $('#telecharger-datasheet-harting-lang')
    const $btnTelecharger = $('#telecharger-datasheet-harting-btn')

    $btnTelecharger.on('click', async function(){
        startBtnLoading($btnTelecharger)
        const ref = $inputRef.val().toString()
        const lang = $selectLang.val()
        if(ref != "" && ref.length > 5){
            if(await MiscUtils.downloadFile(
                "https://b2b.harting.com/files/download/PRD/PDF_DS/PDF_DS_"+ref+"_"+lang+".pdf", 
                ref+"_DATASHEET_"+lang+".pdf",
                {
                    contentType: "application/pdf"
                }
            )) ToastifyUtils.success("Fichier téléchargé")
            else ToastifyUtils.error("Echec du téléchargement")
        }else{
            ToastifyUtils.error("Référence invalide")
        }
        stopBtnLoading($btnTelecharger)
    })
}

waitJQuery(telechargerDatasheetHarting)