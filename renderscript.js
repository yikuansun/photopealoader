const { remote } = require("electron");
const { getGlobal } = remote;

options = getGlobal("options");

Photopea.initEmbed(document.querySelector("div"), JSON.stringify(options)).then(function(data) {
    document.querySelector("#loadingscreen").remove();
});