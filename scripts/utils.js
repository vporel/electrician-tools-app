
function waitJQuery(callable){
    if(window.$)
        callable()
    else
        setTimeout(() => {waitJQuery(callable)}, 25)
}

/**
 * Mettre un bouton en mode chargement
 * Il doit contenir un élément de classe .icon et un élément de classe .spinner
 * @param {*} $btn 
 */
function startBtnLoading($btn){
    $btn.attr("disabled", true)
    $btn.find(".icon").removeClass("d-block").addClass("d-none")
    $btn.find(".spinner").removeClass("d-none").addClass("d-block")
}

/**
 * Sortir un bouton du mode chargement
 * Il doit contenir un élément de classe .icon et un élément de classe .spinner
 * @param {*} $btn 
 */
function stopBtnLoading($btn){
    $btn.attr("disabled", false)
    $btn.find(".icon").removeClass("d-none").addClass("d-block")
    $btn.find(".spinner").removeClass("d-block").addClass("d-none")
}