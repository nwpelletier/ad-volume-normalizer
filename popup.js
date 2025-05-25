document.addEventListener("DOMContentLoaded", () => {
  const twitchToggle = document.getElementById("twitch-toggle");
  const saveBtn = document.getElementById("save-btn");

  // Load saved twitchEnabled setting
  chrome.storage.sync.get(["twitchEnabled"], (data) => {
    if (data.twitchEnabled !== undefined) {
      twitchToggle.checked = data.twitchEnabled;
      console.log("Loaded twitchEnabled:", data.twitchEnabled);
    }
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ twitchEnabled: twitchToggle.checked }, () => {
      saveBtn.textContent = "Saved!";
      console.log("Saved twitchEnabled:", twitchToggle.checked);
      setTimeout(() => (saveBtn.textContent = "Save"), 1000);
    });
  });
});
