const ipcRenderer = require('electron').ipcRenderer;
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('ppapi', {
    getGlobal: async (...theArgs) => { return await ipcRenderer.invoke('getGlobal', ...theArgs); }
})

window.addEventListener('DOMContentLoaded', async () => {
    const customTitlebar = require("custom-electron-titlebar");

    var titlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex("#474747"),
        menu: null,
        onMinimize: () => ipcRenderer.invoke('customTBar', 'minimize'),
        onMaximize: () => ipcRenderer.invoke('customTBar', 'maximize'),
        onClose: () => ipcRenderer.invoke('customTBar', 'close'),
        isMaximized: () => ipcRenderer.invoke('customTBar', 'is-maximized'),
        onMenuItemClick: function () { console.log("nothing"); }
    });

    let options = await ipcRenderer.invoke('getGlobal', "options");

    if (options.environment) {
        if (options.environment.theme != null) {
            var themecolor = ["#e0e0e0", "#474747", "#404550", "#f7f7f7", "#4b3e51", "#353535"][options.environment.theme];
            titlebar.updateBackground(customTitlebar.Color.fromHex(themecolor));
            document.querySelector("#loadingscreen").style.backgroundColor = themecolor;
        }
        let plugins = await ipcRenderer.invoke('getGlobal', "plugins");
        if (options.environment) options.environment.plugins = plugins;
        else {
            options.environment = {
                plugins: plugins
            };

        }
    }

    ipcRenderer.invoke('setGlobal', 'options', options);
});