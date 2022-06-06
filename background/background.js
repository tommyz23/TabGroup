import { Config } from "../common/config.js";

var tabHosts = new Map();
var host2groupId = new Map();

chrome.runtime.onInstalled.addListener((details) => {
    // add listener for config changed
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        console.log(changes);
        for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
            if (key == Config.autoGroupByHost) {
                if (newValue == true) {
                    addAutoGroupListener();
                } else {
                    removeAutoGroupListener();
                }
            }
        }
    });

    // clear cache when tab removed
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        console.log(tabId + "is removing...");
        tabHosts.forEach(function (value, key, map) {
            if (value == tabId) {
                console.log("remove tab in tabHosts: " + tabId);
                map.delete(key);
            }
        });
    });

    // default settings for first start
    chrome.storage.sync.get([Config.autoGroupByHost], function (result) {
        if (result.autoGroupByHost == null) {
            var settingKey = Config.autoGroupByHost;
            chrome.storage.sync.set({ settingKey: true }, function () {
                console.log("auto group tabs by host is set to " + flag);
                addAutoGroupListener();
            });
        } else if (result.autoGroupByHost == true) {
            addAutoGroupListener();
        }
    });
});

function addAutoGroupListener() {
    console.log("add auto-group listener");
    chrome.tabs.onUpdated.addListener(autoGroupListener);
}

function removeAutoGroupListener() {
    console.log("remove auto-group listener");
    chrome.tabs.onUpdated.removeListener(autoGroupListener);
}

function autoGroupListener(tabid, changeInfo, tab) {
    if (changeInfo.url) {
        // this tab's url has changed
        var url = tab.url;
        const { hostname } = new URL(url);
        if (host2groupId.has(hostname)) {
            // already have a group for current host
            var groupId = host2groupId.get(hostname);
            // move tab into the group
            chrome.tabs.group(
                { groupId: groupId, tabIds: tabid },
                function (groupId) {
                    if (chrome.runtime.lastError && groupId == undefined) {
                        console.log("tab group for " + hostname + " is empty");
                        host2groupId.delete(hostname);
                        tabHosts.set(hostname, tabid);
                    }
                }
            );
        } else if (tabHosts.has(hostname)) {
            // opened tab has the same host
            var tabWithSameHost = tabHosts.get(hostname);
            if (tabid != tabWithSameHost) {
                // ensure they are not the same tab
                chrome.tabs.group(
                    { tabIds: [tabWithSameHost, tabid] },
                    function (groupId) {
                        host2groupId.set(hostname, groupId);
                    }
                );
                tabHosts.delete(hostname);
            }
        } else {
            // no tabs have host like current tab
            tabHosts.set(hostname, tabid);
        }
    }
}
