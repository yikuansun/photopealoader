window.ppapi.getGlobal('resources', 'openedFile', 'openedFilePath', 'options').then(function (vars) {
    let { resources, openedFile, openedFilePath, options } = vars;
    document.querySelector("#statusTag").innerText = "Initiating embed...";
    Photopea.initEmbed(document.querySelector("#outerWrap"), options).then(async function (frame) {
        document.querySelector("#statusTag").innerText = "Loading resources...";
        for (var resource of resources) await Photopea.addBinaryAsset(resource);
        document.querySelector("#statusTag").innerText = "Opening...";
        if (openedFile) await Photopea.addImage(openedFile, openedFilePath);
        document.querySelector("#loadingscreen").remove();
        // tests
        // Photopea.message.all(function(d){
        //     console.log("all",d)
        // })
        // Photopea.runScript(function () {
        //     // app.echoToOE("Hello");
        //     app.activeDocument.saveToOE("psd");
        //     app.echoToOE(app.activeDocument.source);
        // }).then(function (result) {
        //     console.log('Script result', result);
        // });
    });
});