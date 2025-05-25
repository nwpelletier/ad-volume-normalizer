// background.js

// Listen for storage changes and broadcast to content scripts
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.twitchEnabled !== undefined) {
    chrome.tabs.query({ url: "*://*.twitch.tv/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs
          .sendMessage(tab.id, {
            type: "updateTwitchEnabled",
            value: changes.twitchEnabled.newValue,
          })
          .catch((err) => {
            // This catch prevents unhandled promise rejection if tab doesn't have listener
            // Just ignore if no receiver
          });
      }
    });
  }
});

// Handle requests from content scripts for current twitchEnabled value
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTwitchEnabled") {
    chrome.storage.sync.get("twitchEnabled", (data) => {
      sendResponse({ value: data.twitchEnabled ?? true }); // default true
    });
    return true; // Keep message channel open for async response
  }
});
