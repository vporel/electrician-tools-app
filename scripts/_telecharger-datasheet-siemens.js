/*
    Télécharger la doc technique d'une référence siemens
    Le fichier téléchargé est mis dans le dossier Téléchargements
    Après analyse des urls de téléchargements sur le site siemens, je me suis rendu compte que le pattern est toujours le même
    La seule chaine qui change est la référence. 
    Il est donc possible de télécharger une doc à partir de ce script sans aller sur le site
*/
function telechargerDatasheetSiemens(){
    const $inputRef = $('#telecharger-datasheet-siemens-ref')
    const $selectLang = $('#telecharger-datasheet-siemens-lang')
    const $btnTelecharger = $('#telecharger-datasheet-siemens-btn')

    $btnTelecharger.on('click', async function(){
        startBtnLoading($btnTelecharger)
        const ref = $inputRef.val().toString().toUpperCase()
        const lang = $selectLang.val()
        if(ref != ""){
            if(await MiscUtils.downloadFile(
                "https://mall.industry.siemens.com/teddatasheet/?format=PDF&caller=Mall&mlfbs="+ref+"&language="+lang.toLowerCase(),
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

waitJQuery(telechargerDatasheetSiemens)