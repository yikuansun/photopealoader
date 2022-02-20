window.ppapi.getGlobal('resources', 'openedFile', 'options').then(function (vars) {
    let { resources, openedFile, options } = vars;
    Photopea.initEmbed(document.querySelector("#outerWrap"), JSON.stringify(options)).then(async function (frame) {
        for (var resource of resources) await Photopea.addBinaryAsset(resource);
        if (openedFile) await Photopea.addBinaryAsset(openedFile);
        document.querySelector("#loadingscreen").remove();
        // test script
        // Photopea.message.all(function(d){
        //     console.log("all",d)
        // })
        // Photopea.runScript('app.echoToOE("Hello");').then(function (result) {
        //     console.log('Script reults',result);
        // })
    });
});

