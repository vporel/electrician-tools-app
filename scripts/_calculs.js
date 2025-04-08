// ======== PUISSANCE > COURANT ===============

function calculsPuissanceCourantMonophase(){
    const $puissance = $('#calculs-P-I-monophase-puissance')
    const $cosphi = $('#calculs-P-I-monophase-cosphi')
    const $courant = $('#calculs-P-I-monophase-courant')

    function calcul(){ 
        const puissance = parseFloat($puissance.val() != "" ? $puissance.val() : 0) * 1000;
        const cosphi = parseFloat($cosphi.val() != "" ? $cosphi.val() : 0)
        $courant.val(
            (puissance != 0 && cosphi != 0)
            ? (puissance / (230 * cosphi)).toFixed(2)
            : 0
        )
    }

    $puissance.on('keyup', calcul)
    $cosphi.on('keyup', calcul)
}

function calculsPuissanceCourantTriphase(){
    const $puissance = $('#calculs-P-I-triphase-puissance')
    const $cosphi = $('#calculs-P-I-triphase-cosphi')
    const $courant = $('#calculs-P-I-triphase-courant')

    function calcul(){ 
        const puissance = parseFloat($puissance.val() != "" ? $puissance.val() : 0) * 1000;
        const cosphi = parseFloat($cosphi.val() != "" ? $cosphi.val() : 0)
        $courant.val(
            (puissance != 0 && cosphi != 0)
            ? (puissance / (Math.sqrt(3) * 400 * cosphi)).toFixed(2)
            : 0
        )
    }

    $puissance.on('keyup', calcul)
    $cosphi.on('keyup', calcul)
}

waitJQuery(calculsPuissanceCourantMonophase)
waitJQuery(calculsPuissanceCourantTriphase)