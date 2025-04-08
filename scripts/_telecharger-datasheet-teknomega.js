/*
    Télécharger la doc technique d'une référence teknomega
    Le fichier téléchargé est mis dans le dossier Téléchargements
    Après analyse des urls de téléchargements sur le site teknomega, je me suis rendu compte que le pattern est toujours le même
    La seule chaine qui change est la référence. 
    Il est donc possible de télécharger une doc à partir de ce script sans aller sur le site

    Une seule langue disponible : l'anglais
*/
function telechargerDatasheetTeknomega(){
    const $inputRef = $('#telecharger-datasheet-teknomega-ref')
    const $selectLang = $('#telecharger-datasheet-teknomega-lang')
    const $btnTelecharger = $('#telecharger-datasheet-teknomega-btn')

    $btnTelecharger.on('click', async function(){
        startBtnLoading($btnTelecharger)
        const ref = $inputRef.val().toString().toUpperCase()
        const lang = $selectLang.val()
        if(ref != ""){
            if(await MiscUtils.downloadFile(
                "https://www.teknomega.it/wp-content/uploads/schedetecniche/"+ref+".pdf",
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

waitJQuery(telechargerDatasheetTeknomega)