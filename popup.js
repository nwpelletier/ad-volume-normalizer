document.addEventListener("DOMContentLoaded", () => {
  const twitchToggle = document.getElementById("twitch-toggle");
  const saveBtn = document.getElementById("save-btn");

  // Load saved twitchEnabled setting
  chrome.storage.sync.get(["twitchEnabled"], (data) => {
    if (data.twitchEnabled !== undefined) {
      twitchToggle.checked = data.twitchEnabled;
    }
  });

  // Save twitchEnabled when Save button clicked
  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ twitchEnabled: twitchToggle.checked }, () => {
      saveBtn.textContent = "Saved!";
      setTimeout(() => (saveBtn.textContent = "Save"), 1000);
    });
  });
});
