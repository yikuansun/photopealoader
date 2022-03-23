let Photopea = (function () {
    var _io = {
        counter: 1,
        opened: {},
        init: function (options) {
            Photopea.addImage = _io.addImage;
            options.environment.customIO = { "open": "app.echoToOE(\"ppapiLoad\");", "save": "app.echoToOE(\"ppapiSave\");" };
            message.of('ppapiLoad', function () {
                io.open();
            });
            message.of('ppapiSave', function () {
                io.save()
            });
        },
        imageFormats: {
            jpg: {
                quality: .82,
                _order: ['quality']
            },
            webp: {
                quality: 1,
                _order: ['quality']
            },
            psd: {
                minified: true,
                _order: ['minified']
            },
            svg: {
                "aadd raster graphics": true,
                "add hidden layers": false,
                "vectorize text": false,
                "rasterize text": false,
                minify: true,
                _order: ['add raster graphics', 'add hidden layers', 'vectorize text', 'rasterize text', 'minify']
            },
            gif: {

            },
            bmp: {

            },
            png: {

            },
            pdf: {

            }

        },
        addImage: function (image, path, contentWindow) {
            if (!contentWindow) contentWindow = Photopea.contentWindow;
            var myPromise = new Promise(function (resolve, reject) {
                Photopea.addBinaryAsset(image, contentWindow).then(function () {
                    _io.opened[_io.counter] = { path: path };
                    let name = path.replace(/^.*(\\|\/|\:)/, '');
                    Photopea.runScript(`app.activeDocument.source="${_io.counter}";app.activeDocument.name="${name}";`).then(() => resolve(_io.counter));
                    _io.counter++;
                });
            });
            return myPromise;
        },
    };

    var io = {
        imageDialogFilters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif', 'psd', 'pdf', 'webp', 'svg', 'bmp'] },
            {name : 'All', extensions:['*']}
        ],
        open: function () {
            let options = { properties: ['openFile'], title: "Open image", buttonLabel: "Open", filters: io.imageDialogFilters };
            var myPromise = new Promise(function (resolve, reject) {
                ppapi.openFile(options).then(function (result) {
                    if (result?.file) {
                        var ext = result.path.split('.').pop();
                        if (_io.imageFormats.hasOwnProperty(ext)) Photopea.addImage(result.file, result.path);
                        else Photopea.addBinaryAsset(result.file);
                    };
                });
            });
            return myPromise
        },
        save: function () {
            var myPromise = new Promise(async function (resolve, reject) {
                let id = await Photopea.runScript('app.echoToOE(app.activeDocument.source)');
                id = id[0];
                let options = { properties: ['saveFile'], title: "Save image", buttonLabel: "Save", filters: io.imageDialogFilters };
                if (_io.opened[id]) {
                    options.defaultPath = _io.opened[id].path;
                };
                let path = '';
                if (!_io.opened[id]?.saved) path = await ppapi.saveDialog(options);
                else path = _io.opened[id].path;
                if (path) {
                    var ext = path.substr(path.lastIndexOf('.') + 1);
                    if (ext == path || !_io.imageFormats[ext]) {
                        resolve();
                        return;
                    };

                    if (!_io.opened[id]?.saved) {
                        //show dialog to select options as this is the first save
                    };

                    let opts = [];
                    if (_io.imageFormats[ext]._order) {
                        _io.imageFormats[ext]._order.forEach(function (key) {
                            opts.push(_io.imageFormats[ext][key]);
                        });
                        opts = ':' + opts.join(',');
                    } else opts = '';
                    let [file] = await Photopea.runScript(`app.activeDocument.saveToOE("${ext}${opts}");`);
                    let saved = await ppapi.saveFile(path, file);
                    let name = path.replace(/^.*(\\|\/|\:)/, '');
                    if (saved) {
                        await Photopea.runScript(`app.activeDocument.name="${name}";alert("Saved ${name}")`);
                        if (!_io.opened[id]) _io.opened[id] = {};
                        _io.opened[id].saved = true;
                        _io.opened[id].path = path;
                        resolve(id);
                        return;
                    } else {
                        await Photopea.runScript(`alert("Failed to save ${name}")`)
                    };
                    resolve();
                };
            });
            return myPromise
        },
    }

    var _message = {
        init: function (context) {
            function handler(e) {
                if (e.source == context) {
                    if (_message.que.length || _message.all.length || Object.keys(_message.of)) {
                        if (_message.all.length) _message.all.forEach(function (f) {
                            f(e.data);
                        });
                        if (_message.of[e.data]) {
                            _message.of[e.data]();
                            return;
                        };
                        if (e.data != 'done') {
                            if (_message.que.length) _message.que[0](e.data);
                            return;
                        };
                        if (_message.que.length) _message.que.shift()(e.data);
                    } else {
                        console.log("Unhandled message from PhotoPea", e);
                    };
                };
            };
            window.addEventListener("message", handler);
            _message.context = context;
        },
        que: [],
        all: [],
        of: {},
    };

    var message = {
        que: function (func) {
            _message.que.push(func);
        },
        all: function (func) {
            _message.all.push(func);
        },
        of(what, func) {
            if (!func) {
                delete _message.of[what];
                return;
            };
            _message.of[what] = func;
        }
    }

    var Photopea = {
        initEmbed: async function (elem_to_append_to, options) {
            var iframe = document.createElement("iframe");
            iframe.style.border = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            if (options.enableIO == true) {
                _io.init(options);
            };
            if (options != undefined) iframe.src = "https://www.photopea.com#" + encodeURI(JSON.stringify(options));
            else iframe.src = "https://www.photopea.com";
            elem_to_append_to.appendChild(iframe);
            Photopea.contentWindow = iframe.contentWindow;
            let myPromise = new Promise(function (resolve, reject) {
                _message.init(iframe.contentWindow);
                message.que(function () {
                    console.log('Photopea loaded and ready.');
                    resolve(iframe);
                });
            });
            return await myPromise;
        },
        runScript: function (script, contentWindow) {
            if (typeof script === 'function') {
                script = script.toString().split('\n').slice(1, -1).join('\n').trim();
            };
            if (!contentWindow) contentWindow = Photopea.contentWindow;
            var myPromise = new Promise(function (resolve, reject) {
                let result = [];
                message.que(function (data) {
                    if (data != 'done') {
                        result.push(data);
                        return;
                    };
                    console.log('Script executed.');
                    resolve(result);
                });
            });
            contentWindow.postMessage(script, "*");
            return myPromise;
        },
        addBinaryAsset: function (asset, contentWindow) {
            if (!contentWindow) contentWindow = Photopea.contentWindow;
            var myPromise = new Promise(function (resolve, reject) {
                message.que(function () {
                    console.log('Added Asset.');
                    resolve(true);
                });
            });
            contentWindow.postMessage(asset, "*");
            return myPromise;
        },
        message: message,
    };
    return Photopea;
})();