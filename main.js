const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron')
const path = require('path')
const fs   = require("fs")
const https = require('https')
const xlsx = require('node-xlsx')
const { exec } = require('child_process');
const xmlbuilder = require('xmlbuilder');
const pdfparse = require('pdf-parse');

//Quit the app if squirrel is running
if (require('electron-squirrel-startup')) app.quit();

const APP_FILES_PATH = process.env.USERPROFILE + "/Documents/EBE Tools"
const SETTINGS_FILE_PATH = APP_FILES_PATH + "/settings.json"
let settings = {
    "generateur-doe.dossier-bd": "",
    "generateur-doe.enregistrer-dossier-bd": true,
}

try {
    require('electron-reloader')(module)
  } catch (_) {}

const createWindow = () => {
    const {width, height} = screen.getPrimaryDisplay().workAreaSize
    const window = new BrowserWindow({
        width,
        height,
        icon: "./assets/images/icon.png",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    //Create the settings file if it does not exists
    if(fs.existsSync(SETTINGS_FILE_PATH)){
        settings = JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH))
    }else{
        if(!fs.existsSync(APP_FILES_PATH)) fs.mkdirSync(APP_FILES_PATH)
        fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings))
    }

    window.loadFile(`./views/index.html`);
    window.maximize()
    window.webContents.openDevTools() 
}

app.whenReady().then(() => {
    createWindow()
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    /* EVENTS */

    // SETTINGS
    ipcMain.handle('settings.get', async (event, key) => {  
        return settings[key]
    });

    ipcMain.handle('settings.set', async (event, key, value) => {  
        settings[key] = value 
        try {    
            fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings))
            return true
        } catch(err){
            console.log(err)
            return false
        }
    });

    // ELECTRON

    ipcMain.handle('electron.dialog', async (event, method, params) => {  
        return await dialog[method](BrowserWindow.getFocusedWindow(), params);
    });

    // SYSTEM
    ipcMain.handle('system.allFilesPaths', async (event, rootPath) => {      
        let paths  = [];
        function parseDirectory(dir) {
            fs.readdirSync(dir).forEach(filePath => {
                const absoluteFilePath = path.join(dir, filePath);
                if (fs.statSync(absoluteFilePath).isDirectory()) return parseDirectory(absoluteFilePath);
                else paths.push(absoluteFilePath);
            });
        }
        parseDirectory(rootPath)
        return paths
    });

    // SYSTEM.PATH
    ipcMain.handle('system.path.basename', async (event, filePath) => {      
        return await path.basename(filePath)
    });
    ipcMain.handle('system.path.dirname', async (event, filePath) => {      
        return await path.dirname(filePath)
    });

    // SYSTEM.FS
    ipcMain.handle('system.fs.exists', async (event, filePath) => {   
        return await fs.existsSync(filePath)
    });
    ipcMain.handle('system.fs.mkdir', async (event, dirPath) => {
        try {    
            fs.mkdirSync(dirPath)
            return true
        } catch(err){
            console.log(err)
            return false
        }
    });
    ipcMain.handle('system.fs.copyFile', async (event, srcPath, destPath) => {      
        try {
            fs.copyFileSync(srcPath, destPath);
            return true
        } catch(err) {
            console.log(err)
            return false
        }
    });

    // MISCELLANEOUS
    ipcMain.handle('misc.readExcelFile', async (event, filePath) => {   
        if(!filePath || filePath == "") return
        const rows = await xlsx.parse(filePath)
        return rows
    });

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
     */
    ipcMain.handle('misc.writeExcelFile', async (event, filePath, data, options = {}) => {   
        const _options = {
            openOnFinish: true,
            ...options
        }
        const sheetOptions  = {}
        if(_options.columnsWidths) sheetOptions['!cols'] = _options.columnsWidths.map(w => ({wch: w}))
        if(_options.rowsHeights) sheetOptions['!rows'] = _options.rowsHeights.map(h => ({hpt: h}))

        if(!filePath || filePath == "") return
        try {
            fs.writeFileSync(
                filePath,
                await xlsx.build(data, {sheetOptions})
            )
            if(_options.openOnFinish) exec(`start "" "${filePath}"`);
            return true
        } catch(err) {
            console.log(err)
            return false
        }
    });
    
    /**
     * @param {any} data
    */
    ipcMain.handle('misc.buildXML', async (event, data) => {   
            return xmlbuilder.create(data).end({ pretty: true})
    });

    /**
     * @param {string} filePath
     */
    ipcMain.handle('misc.readFile', async (event, filePath, options = {}) => {   
        if(!filePath || filePath == "") return null
        try {
            return fs.readFileSync(filePath, options)
        } catch(err) {
            console.log(err)
            return null
        }
    });

    /**
     * @param {string} filePath
     * @param {any} data
     * @param {
     *  {
    *      openOnFinish: boolean
    *  }
    * } options
    */
    ipcMain.handle('misc.writeFile', async (event, filePath, data, options) => {   
        const _options = {
            openOnFinish: true,
            ...options
        }
        if(!filePath || filePath == "") return
        try {
            fs.writeFileSync(
                filePath,
                data
            )
            if(_options.openOnFinish) exec(`start "" "${filePath}"`);
            return true
        } catch(err) {
            console.log(err)
            return false
        }
    });

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
    ipcMain.handle('misc.downloadFile', async (event, url, destFileName, options = {}) => {   
        return new Promise(resolve => {
            const filePath = process.env.USERPROFILE + "/Downloads/"+destFileName
            var file = fs.createWriteStream(filePath);
            https.get(url, function(response) {
                if(options && options.contentType && options.contentType.toLowerCase() != response.headers["content-type"].toLowerCase()){
                    resolve(false)
                    return
                } 
                response.pipe(file);
                file.on('finish', function() {
                    file.close()
                    resolve(filePath)
                });
                file.on("error", () => {
                    resolve(false)
                })
            });
        })
    });

    /**
     * @param {string} filePath
     * @returns {void}
     */
    ipcMain.handle('misc.startFile', async (event, filePath) => {   
        return new Promise(resolve => {
            exec(`start "" "${filePath}"`);
            resolve(true)
        })
    });

    /**
     * @param {string} filePath
     * @returns {void}
     */
    ipcMain.handle('misc.openDirAndSelectFile', async (event, filePath) => {   
        return new Promise(resolve => {
            exec(`explorer /select,"${filePath.replaceAll("/", "\\")}"`);
            resolve(true)
        })
    });

    /**
     * @param {string} filePath
     */
    ipcMain.handle('misc.getTextsFromPdf', async (event, filePath, options = {}) => {   
        if(!filePath || filePath == "") return null
        try {
            const data = await pdfparse(fs.readFileSync(filePath));
            return data.text
        } catch(err) {
            console.log(filePath)
            console.log(err)
            return null
        }
    });

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})