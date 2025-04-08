/**
 * Settings
 * This objects uses the tools provided by the main process
 * those tools are in the object settings or window.settings
 */

const SettingsUtils = {
    /**
     * @param {string} key 
     * @returns Promise<any>
     */
    get: settings.get,

    /**
     * @param {string} key 
     * @param {any} value 
     * @returns Promise<boolean>
     */
    set: settings.set,
}