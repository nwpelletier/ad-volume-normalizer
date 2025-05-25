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
          .catch(() => {
            // Ignore errors from tabs without the content script
          });
      }
    });
  }
});

// Handle requests from content scripts (future-proofing)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTwitchEnabled") {
    chrome.storage.sync.get("twitchEnabled", (data) => {
      sendResponse({ value: data.twitchEnabled ?? true });
    });
    return true; // Allow async response
  }
});
