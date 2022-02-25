window.ppapi.getGlobal('resources', 'openedFile', 'openedFilePath', 'options').then(function (vars) {
    let { resources, openedFile, openedFilePath, options } = vars;
    Photopea.initEmbed(document.querySelector("#outerWrap"), options).then(async function (frame) {
        for (var resource of resources) await Photopea.addBinaryAsset(resource);
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