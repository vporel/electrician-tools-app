/**
 * This objects uses the tools provided by the main process
 * those tools are in the object system or window.system
 */

const SystemUtils = {
    /**
     * @param {string} rootPath 
     * @returns Promise<string[]>
     */
    getAllFilesPath: system.getAllFilesPath,
   
    path: {
        /**
         * @param {string} filePath file or directory 
         * @returns Promise<string>
         */
        basename: system.path.basename,

        /**
         * @param {string} filePath file or directory 
         * @returns Promise<string>
         */
        dirname: system.path.dirname
    },

    fs: {
        /**
         * @param {string} filePath file or directory 
         * @returns Promise<boolean>
         */
        exists: system.fs.exists,

        /**
         * @param {string} dirPath 
         * @returns Promise<boolean>
         */
        mkdir: system.fs.mkdir,

        /**
         * @param {string} srcPath 
         * @param {string} destPath 
         * @returns Promise<boolean>
         */
        copyFile: system.fs.copyFile,
    }
}