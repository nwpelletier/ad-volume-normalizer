// background.js

// When twitchEnabled changes, notify all Twitch tabs to update their state
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.twitchEnabled !== undefined) {
    chrome.tabs.query({ url: "*://*.twitch.tv/*" }, (tabs) => {
      for (const tab of tabs) {
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: "updateTwitchEnabled",
            value: changes.twitchEnabled.newValue,
          });
        } catch (err) {
          // Ignore errors if tab does not have the content script listening
        }
      }
    });
  }
});

// Respond to messages from content or popup scripts asking for current twitchEnabled
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTwitchEnabled") {
    chrome.storage.sync.get("twitchEnabled", (data) => {
      sendResponse({ value: data.twitchEnabled ?? true }); // default true
    });
    return true; // Keep the message channel open for async response
  }
});
