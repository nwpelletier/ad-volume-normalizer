// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const twitchToggle = document.getElementById("twitch-toggle");
  const saveBtn = document.getElementById("save-btn");

  // Load current setting from storage
  chrome.storage.sync.get(["twitchEnabled"], (data) => {
    twitchToggle.checked = data.twitchEnabled !== false; // default to true
  });

  // Save updated setting when button clicked
  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ twitchEnabled: twitchToggle.checked }, () => {
      saveBtn.textContent = "Saved!";
      setTimeout(() => (saveBtn.textContent = "Save Settings"), 1000);
    });
  });
});
