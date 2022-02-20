window.ppapi.getGlobal('resources', 'openedFile', 'options', 'plugins').then(function (vars) {
    let { resources, openedFile, options, plugins } = vars;
    if (options.environment) options.environment.plugins = plugins;
    else {
        options.environment = {
            plugins: plugins
        };

    }
    setTimeout(function(e) { console.log(options) }, 699);
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

