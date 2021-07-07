var request = new XMLHttpRequest();
request.open("GET", "https://raw.githubusercontent.com/yikuansun/photopeaenvironment/master/environment.json", false);
request.send();
options = request.responseText;

Photopea.initEmbed(document.querySelector("div"), options).then(function(data) {
    document.querySelector("#loadingscreen").remove();
});