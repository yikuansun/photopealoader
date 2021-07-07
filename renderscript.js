const { remote } = require("electron");
const { getGlobal } = remote;

options = getGlobal("options");

Photopea.initEmbed(document.querySelector("div"), JSON.stringify(options)).then(function(frame) {
    document.querySelector("#loadingscreen").remove();
    for (var resource of getGlobal("resources")) Photopea.addBinaryAsset(frame.contentWindow, resource).then();
});