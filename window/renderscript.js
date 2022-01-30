const { remote } = require("electron");
const { getGlobal, BrowserWindow } = remote;
const customTitlebar = require("custom-electron-titlebar");

var titlebar = new customTitlebar.Titlebar({
	backgroundColor: customTitlebar.Color.fromHex("#474747"),
    menu: null,
    onMinimize: function() { BrowserWindow.getFocusedWindow().minimize(); },
    onMaximize: function() { BrowserWindow.getFocusedWindow().isMaximized()?BrowserWindow.getFocusedWindow().unmaximize():BrowserWindow.getFocusedWindow().maximize(); },
    onClose: function() { BrowserWindow.getFocusedWindow().close() },
    isMaximized: function() { return BrowserWindow.getFocusedWindow().isMaximized() },
    onMenuItemClick: function() { console.log("nothing"); }
});

var options = getGlobal("options");

if (options.environment) {
    if (options.environment.theme != null) {
        var themecolor = ["#e0e0e0", "#474747", "#404550", "#f7f7f7", "#4b3e51", "#353535"][options.environment.theme];
        titlebar.updateBackground(customTitlebar.Color.fromHex(themecolor));
        document.querySelector("#loadingscreen").style.backgroundColor = themecolor;
    }
}

if (options.environment) options.environment.plugins = getGlobal("plugins");
else {
    options.environment = {
        plugins: getGlobal("plugins")
    }
}
console.log(options)
Photopea.initEmbed(document.querySelector("#outerWrap"), JSON.stringify(options)).then(function(frame) {
    document.querySelector("#loadingscreen").remove();
    for (var resource of getGlobal("resources")) Photopea.addBinaryAsset(frame.contentWindow, resource).then();
    if (getGlobal("openedFile")) Photopea.addBinaryAsset(frame.contentWindow, getGlobal("openedFile")).then();
});