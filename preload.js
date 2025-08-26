const  { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('settings', {
    get: async (key) => await ipcRenderer.invoke('settings.get', key),
    set: async (key, value) => await ipcRenderer.invoke('settings.set', key, value)
})  

contextBridge.exposeInMainWorld('electron', {
    showOpenDialog: async (options) => await ipcRenderer.invoke('electron.dialog', 'showOpenDialog', options),
    showSaveDialog: async (options) => await ipcRenderer.invoke('electron.dialog', 'showSaveDialog', options)
})  

contextBridge.exposeInMainWorld('system', {
    getAllFilesPath: async (rootPath) => await ipcRenderer.invoke('system.allFilesPaths', rootPath),
    path: {
        basename: async (filePath) => await ipcRenderer.invoke('system.path.basename', filePath),
        dirname: async (filePath) => await ipcRenderer.invoke('system.path.dirname', filePath)
    },
    fs: {
        exists: async (filePath) => await ipcRenderer.invoke('system.fs.exists', filePath),
        mkdir: async (dirPath) => await ipcRenderer.invoke('system.fs.mkdir', dirPath),
        copyFile: async (srcPath, destPath) => await ipcRenderer.invoke('system.fs.copyFile', srcPath, destPath),
    }
})  

//Miscellaneous
contextBridge.exposeInMainWorld('misc', {
    readExcelFile: async (filePath) => await ipcRenderer.invoke('misc.readExcelFile', filePath),
    writeExcelFile: async (filePath, data, options) => await ipcRenderer.invoke('misc.writeExcelFile', filePath, data, options),
    buildXML: async (data) => await ipcRenderer.invoke('misc.buildXML', data),
    readFile: async (filePath, options) => await ipcRenderer.invoke('misc.readFile', filePath, options),
    writeFile: async (filePath, data, options) => await ipcRenderer.invoke('misc.writeFile', filePath, data, options),
    downloadFile: async (url, destFileName, options) => await ipcRenderer.invoke('misc.downloadFile', url, destFileName, options),
    startFile: async (filePath) => await ipcRenderer.invoke('misc.startFile', filePath),
    openDirAndSelectFile: async (filePath) => await ipcRenderer.invoke('misc.openDirAndSelectFile', filePath),
    getTextsFromPdf: async (filePath, options) => await ipcRenderer.invoke('misc.getTextsFromPdf', filePath, options)
})  