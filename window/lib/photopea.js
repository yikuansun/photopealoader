var Photopea = {
    initEmbed: async function (elem_to_append_to, config) {
        var iframe = document.createElement("iframe");
        iframe.style.border = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        if (config) iframe.src = "https://www.photopea.com#" + encodeURI(config);
        else iframe.src = "https://www.photopea.com";
        elem_to_append_to.appendChild(iframe);
        let self = this;
        this.contentWindow=iframe.contentWindow;
        let myPromise = new Promise(function (resolve, reject) {
            self.message.init(iframe.contentWindow);
            self.message.que(function () {
                console.log('Photopea loaded and ready.')
                resolve(iframe);
            })
        });
        return await myPromise;
    },
    runScript: async function (script, contentWindow) {
        if(!contentWindow)contentWindow=this.contentWindow;
        let self = this;
        var myPromise = new Promise(function (resolve, reject) {
            let result = [];
            self.message.que(function (data) {
                if (data != 'done') {
                    result.push(data);
                    return;
                }
                console.log('Script executed.');
                resolve(result);
            });
        });
        contentWindow.postMessage(script, "*");
        var returnedMessage = await myPromise;
        return returnedMessage;
    },
    addBinaryAsset: async function (asset, contentWindow) {
        if(!contentWindow)contentWindow=this.contentWindow;
        let self = this;
        var myPromise = new Promise(function (resolve, reject) {
            self.message.que(function () {
                console.log('Added Assest.')
                resolve(true);
            });
        });
        contentWindow.postMessage(asset, "*");
        return await myPromise
    },
    message: {
        init: function (context) {
            let self = this;
            function handler(e) {
                if (e.source == context) {
                    if (self._que.length || self._all.length) {
                        if (self._all.length) self._all.forEach(function (f) {
                            f(e.data);
                        })
                        if (e.data != 'done') {
                            if (self._que.length) self._que[0](e.data);
                            return;
                        }
                        if (self._que.length) self._que.shift()(e.data);
                    } else {
                        console.log("Unhandled message from PhotoPea", e)
                    }
                }
            }
            window.addEventListener("message", handler);
            this._context = context;
        },
        _que: [],
        _all: [],
        que:function(func){
            this._que.push(func);
        },
        all:function(func){
            this._all.push(func);
        }
    },
};