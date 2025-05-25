// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const twitchToggle = document.getElementById("twitch-toggle");
  const saveBtn = document.getElementById("save-btn");
  const adVolumeRadios = document.querySelectorAll(
    'input[name="adVolumeMode"]'
  );

  // Load saved settings
  chrome.storage.sync.get(["twitchEnabled", "adVolumeMode"], (data) => {
    if (data.twitchEnabled !== undefined)
      twitchToggle.checked = data.twitchEnabled;

    if (data.adVolumeMode) {
      for (const radio of adVolumeRadios) {
        radio.checked = radio.value === data.adVolumeMode;
      }
    }
  });

  saveBtn.addEventListener("click", () => {
    const selectedMode = Array.from(adVolumeRadios).find(
      (r) => r.checked
    )?.value;

    chrome.storage.sync.set(
      { twitchEnabled: twitchToggle.checked, adVolumeMode: selectedMode },
      () => {
        saveBtn.textContent = "Saved!";
        setTimeout(() => (saveBtn.textContent = "Save Settings"), 1500);
      }
    );
  });
});
