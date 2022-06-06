const autoGroupByHost = "autoGroupByHost";

class Config {
    constructor() {}

    static setAutoGroupByHost(flag) {
        chrome.storage.sync.set({ autoGroupByHost: flag }, function () {
            console.log("auto group tabs by host is updated to " + flag);
        });
    }

    static getAutoGroupByHost() {
        chrome.storage.sync.get([autoGroupByHost], function (result) {
            console.log(result.autoGroupByHost);
            return result.autoGroupByHost;
        });
    }

    static setDefaultConfigIfUnset() {
        chrome.storage.sync.get([autoGroupByHost], function (result) {
            console.log(result);
            if(result.autoGroupByHost == null) {
                chrome.storage.sync.set({ autoGroupByHost: true }, function () {
                    console.log("auto group tabs by host is set to " + flag);
                });
            }
        });
    }

    static get autoGroupByHost() {
        return autoGroupByHost;
    }
}

export { Config };
