/**
 * Miscellaneous
 * This objects uses the tools provided by the main process
 * those tools are in the object misc or window.misc
 */

const MiscUtils = {
    /**
     * @param {string} filePath 
     * @returns Promise<Array<{ //Array of sheets
     * 
     *  name: string //sheet name
     * 
     *  data: Array<Array<any>>
     * 
     * }>>
     */
    readExcelFile: misc.readExcelFile,

    /**
     * @param {string} filePath 
     * @param {
     *  Array<{
    *      name: string, 
    *      data: Array<Array<any>>
    *  }>
    * } data
    * @param {
    *  {
    *      columsWidths: Array<number>,
    *      rowsHeights: Array<number>,
    *      openOnFinish: boolean
    *  }
    * } options
     * @returns {Promise<boolean>}
     */
    writeExcelFile: misc.writeExcelFile,

    /**
     * @param {any} data
     * @returns {Promise<any>}
     */
    buildXML: misc.buildXML,

    /**
     * @param {string} filePath 
     * @param {any} options 
     * @returns {Promise<any>}
     */
    readFile: misc.readFile,
    
    /**
     * @param {string} filePath 
     * @param {any} data
     * @param {
     *  {
     *      openOnFinish: boolean
     *  }
     * } options
     * @returns {Promise<boolean>}
     */
    writeFile: misc.writeFile,
    
    /**
     * @param {string} url 
     * @param {string} destFileName 
     * @param {
     *  {
     *      contentType
     *  }
     * } options
     * @returns {Promise<string|false>} file path
     */
    downloadFile: misc.downloadFile,

    /**
     * @param {string} filePath 
     * @returns {void}
     */
    startFile: misc.startFile,

    /**
     * @param {string} filePath 
     * @returns {void}
     */
    openDirAndSelectFile: misc.openDirAndSelectFile,

    /**
     * @param {string} filePath 
     * @param {any} options 
     * @returns {Promise<any>}
     */
    getTextsFromPdf: misc.getTextsFromPdf,
}