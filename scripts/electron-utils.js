/**
 * This objects uses the tools provided by the main process
 * those tools are in the object electron or window.electron
 */

const ElectronUtils = {
    openDirectory: async () => {
        const result = await electron.showOpenDialog({ properties: ['openDirectory'] })
        if(result.canceled || result.filePaths.length == 0) return null
        return result.filePaths[0]
    },

    /**
     * 
     * @param {*} options {
     * 
     *  filters: Array<{name: string, extensions: string[]}> //extensions without dots (txt, jpg, ...)
     * 
     * }
     * @returns {string|null}
     */
    openFile: async (options = {}) => {
        const _options = {
            ...({
                filters: [
                    {name: "Tous les fichiers", extensions: ['*']}
                ]
            }),
            ...options
        }
        const properties = ['openFile']
        const result = await electron.showOpenDialog({ properties, filters: _options.filters})
        if(result.canceled || result.filePaths.length == 0) return null
        return result.filePaths[0]
    },

    /**
     * 
     * @param {*} options {
     * 
     *  multiple: boolean = true
     * 
     *  filters: Array<{name: string, extensions: string[]}> //extensions without dots (txt, jpg, ...)
     * 
     * }
     * @returns {string[]|null}
     */
    openFiles: async (options = {}) => {
        const _options = {
            ...({
                multiple: true, 
                filters: [
                    {name: "Tous les fichiers", extensions: ['*']}
                ]
            }),
            ...options
        }
        const properties = ['openFile']
        if(_options.multiple) properties.push('multiSelections')
        const result = await electron.showOpenDialog({ properties, filters: _options.filters})
        if(result.canceled) return null
        return result.filePaths
    },

    /**
     * 
     * @param {*} options {
     * 
     *  filters: Array<{name: string, extensions: string[]}> //extensions without dots (txt, jpg, ...)
     * 
     * }
     * @returns 
     */
    saveFile: async (options = {}) => {
        const _options = {
            ...({
                filters: [
                    {name: "Tous les fichiers", extensions: ['*']}
                ]
            }),
            ...options
        }
        const result = await electron.showSaveDialog({ filters: _options.filters})
        if(result.canceled) return null
        return result.filePath
    }
}