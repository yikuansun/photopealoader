const ipcRenderer = require('electron').ipcRenderer;
const { contextBridge } = require('electron');
const path = require('path');

/// This should be part of potopea.js api files as thats whats expecting it.

contextBridge.exposeInMainWorld('ppapi', {
    getGlobal: async (...theArgs) => { return await ipcRenderer.invoke('getGlobal', ...theArgs); },
    openDialog: async (...theArgs) => { return await ipcRenderer.invoke('openDialog', ...theArgs); },
    saveDialog: async (...theArgs) => { return await ipcRenderer.invoke('saveDialog', ...theArgs); },
    openFile: async (...theArgs) => { return await ipcRenderer.invoke('openFile', ...theArgs); },
    saveFile: async (...theArgs) => { return await ipcRenderer.invoke('saveFile', ...theArgs); },
});
///

window.addEventListener('DOMContentLoaded', async () => {
    const customTitlebar = require("custom-electron-titlebar");

    let titlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex("#474747"),
        // itemBackgroundColor: Color.fromHex("#121212"),
        // svgColor: Color.WHITE,
        icon: path.join(__dirname, '/build/', '/icon.png'),
        menu: null, // = do not automatically use Menu.applicationMenu
        onMenuItemClick: function () { console.log("nothing"); },
        onClose: () => ipcRenderer.invoke('customTBar', 'close'),
    })

    let options = await ipcRenderer.invoke('getGlobal', "options");

    if (options.environment) {
        if (options.environment.theme != null) {
            var themecolor = ["#e0e0e0", "#474747", "#404550", "#f7f7f7", "#4b3e51", "#353535"][options.environment.theme];
            titlebar.updateBackground(customTitlebar.Color.fromHex(themecolor));
            document.querySelector("#loadingscreen").style.backgroundColor = themecolor;
        }
        // let plugins = await ipcRenderer.invoke('getGlobal', "plugins");
        // if (options.environment) options.environment.plugins = plugins;
        // else {
        //     options.environment = {
        //         plugins: plugins
        //     };
        // 
        // }
    }

    ipcRenderer.invoke('setGlobal', 'options', options);

    ipcRenderer.on('app-close', _ => {
        ipcRenderer.send('closed');
    });
});