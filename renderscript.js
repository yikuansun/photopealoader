const { remote } = require("electron");
const { getGlobal } = remote;

options = getGlobal("options");

if (options.environment) options.environment.plugins = getGlobal("plugins");
else {
    options.environment = {
        plugins: getGlobal("plugins")
    }
}

Photopea.initEmbed(document.querySelector("div"), JSON.stringify(options)).then(function(frame) {
    document.querySelector("#loadingscreen").remove();
    for (var resource of getGlobal("resources")) Photopea.addBinaryAsset(frame.contentWindow, resource).then();
    if (getGlobal("openedFile")) Photopea.addBinaryAsset(frame.contentWindow, getGlobal("openedFile")).then();
});