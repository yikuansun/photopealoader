const { remote } = require("electron");
const { getGlobal } = remote;
const customTitlebar = require("custom-electron-titlebar");

new customTitlebar.Titlebar({
	backgroundColor: customTitlebar.Color.fromHex("#353535"),
    menu: null
});

options = getGlobal("options");

if (options.environment) options.environment.plugins = getGlobal("plugins");
else {
    options.environment = {
        plugins: getGlobal("plugins")
    }
}

Photopea.initEmbed(document.querySelector("#outerWrap"), JSON.stringify(options)).then(function(frame) {
    document.querySelector("#loadingscreen").remove();
    for (var resource of getGlobal("resources")) Photopea.addBinaryAsset(frame.contentWindow, resource).then();
    if (getGlobal("openedFile")) Photopea.addBinaryAsset(frame.contentWindow, getGlobal("openedFile")).then();
});