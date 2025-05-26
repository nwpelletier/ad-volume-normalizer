let twitchEnabled = true;
let adVolumeMode = "mute";
let userPreferredVolume = null;
let adIsPlaying = false;

const volumeSliderSelector = 'input[data-a-target="player-volume-slider"]';

// Load settings from storage
chrome.storage.sync.get(
  ["twitchEnabled", "adVolumeMode", "userPreferredVolume"],
  (data) => {
    if (data.twitchEnabled !== undefined) twitchEnabled = data.twitchEnabled;
    if (data.adVolumeMode) adVolumeMode = data.adVolumeMode;
    if (data.userPreferredVolume !== undefined)
      userPreferredVolume = data.userPreferredVolume;
    console.log("Settings loaded:", {
      twitchEnabled,
      adVolumeMode,
      userPreferredVolume,
    });
  }
);

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.twitchEnabled) twitchEnabled = changes.twitchEnabled.newValue;
    if (changes.adVolumeMode) adVolumeMode = changes.adVolumeMode.newValue;
    if (changes.userPreferredVolume)
      userPreferredVolume = changes.userPreferredVolume.newValue;
  }
});

function setVolume(v) {
  const slider = document.querySelector(volumeSliderSelector);
  if (slider) {
    slider.value = v;
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("Volume set to", v);
  } else {
    console.warn("Volume slider not found");
  }
}

function getVolume() {
  const slider = document.querySelector(volumeSliderSelector);
  return slider ? parseFloat(slider.value) : null;
}

function onUserVolumeChange() {
  const vol = getVolume();
  if (vol !== null && !adIsPlaying) {
    userPreferredVolume = vol;
    chrome.storage.sync.set({ userPreferredVolume: vol });
    console.log("User volume changed to", vol);
  }
}

function isAdPlaying() {
  return !!document.querySelector('[data-a-target="video-ad-countdown"]');
}

function checkAd() {
  const adPlaying = isAdPlaying();

  if (adPlaying && !adIsPlaying) {
    adIsPlaying = true;
    console.log("Ad detected");

    if (twitchEnabled && adVolumeMode !== "vol-default") {
      const currentVol = getVolume();
      if (currentVol !== null) {
        userPreferredVolume = currentVol;
        chrome.storage.sync.set({ userPreferredVolume: currentVol });
        console.log("Saved user volume before ad:", currentVol);
      }

      let targetVol = 0;
      switch (adVolumeMode) {
        case "vol-dim":
          targetVol = Math.max(0, Math.min(1, userPreferredVolume / 2));
          break;
        case "vol-mute":
          targetVol = 0;
          break;
        case "vol-default":
        default:
          return;
      }

      setVolume(targetVol);
      console.log(`Throttled volume during ad to: ${targetVol}`);
    }
  } else if (!adPlaying && adIsPlaying) {
    adIsPlaying = false;
    console.log("Ad ended");

    if (
      twitchEnabled &&
      adVolumeMode !== "vol-default" &&
      userPreferredVolume !== null
    ) {
      setVolume(userPreferredVolume);
      console.log("Restored volume after ad to:", userPreferredVolume);
    }
  }
}

function waitForVolumeSlider(attempts = 0) {
  const slider = document.querySelector(volumeSliderSelector);
  if (slider) {
    slider.addEventListener("input", onUserVolumeChange);
    console.log("Volume slider found and event listener attached.");
  } else if (attempts < 20) {
    setTimeout(() => waitForVolumeSlider(attempts + 1), 500);
  } else {
    console.warn("Volume slider not found after multiple attempts.");
  }
}

function setup() {
  waitForVolumeSlider();
  setInterval(checkAd, 1000);
}

setup();
