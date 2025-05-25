document.addEventListener("DOMContentLoaded", () => {
  const enableToggle = document.getElementById("enableToggle");
  const modeRadios = document.querySelectorAll('input[name="mode"]');

  // Load settings from storage
  chrome.storage.sync.get(["twitchEnabled", "adVolumeMode"], (data) => {
    enableToggle.checked = data.twitchEnabled ?? true;

    for (const radio of modeRadios) {
      if (radio.value === data.adVolumeMode) {
        radio.checked = true;
      }
    }
  });

  // Toggle setting
  enableToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ twitchEnabled: enableToggle.checked });
  });

  // Mode change
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        chrome.storage.sync.set({ adVolumeMode: radio.value });
      }
    });
  });
});
