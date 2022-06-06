import { Config } from "../common/config.js";

let autogroupElement = document.getElementById("autogroup");

window.onload = function () {
    autogroupElement.onchange = function() {
        console.log("auto-group setting changed by popup, value: " + autogroupElement.checked);
        Config.setAutoGroupByHost(autogroupElement.checked);
    };

    // init auto-group checked value
    var autogroupTag = Config.autoGroupByHost;
    chrome.storage.sync.get([autogroupTag], function (result) {
        autogroupElement.checked = result.autogroupTag;
    });
}