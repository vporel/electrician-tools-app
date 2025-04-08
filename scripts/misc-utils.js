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
     * @returns Promise<boolean>
     */
    writeExcelFile: misc.writeExcelFile,
    
    /**
     * @param {string} url 
     * @param {string} destFileName 
     * @param {
     *  {
    *      contentType
    *  }
    * } options
     * @returns Promise<boolean>
     */
    downloadFile: misc.downloadFile
}