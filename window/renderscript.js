window.addEventListener('DOMContentLoaded', async () => {
    window.ppapi.getGlobal('resources', 'openedFile', 'options').then(function (vars) {
        let { resources, openedFile, options } = vars;
        Photopea.initEmbed(document.querySelector("#outerWrap"), JSON.stringify(options)).then(function (frame) {
            document.querySelector("#loadingscreen").remove();
            for (var resource of resources) Photopea.addBinaryAsset(frame.contentWindow, resource).then();
            if (openedFile) Photopea.addBinaryAsset(frame.contentWindow, openedFile).then();
        });
    });
});