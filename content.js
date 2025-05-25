// content.js

let twitchEnabled = true;
let adVolumeMode = "mute"; // "mute", "quiet", "off"
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
    console.log(
      "Settings loaded:",
      twitchEnabled,
      adVolumeMode,
      userPreferredVolume
    );
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
  if (vol !== null) {
    userPreferredVolume = vol;
    chrome.storage.sync.set({ userPreferredVolume: vol });
    console.log("User volume changed to", vol);
  }
}

// Ad detection function
function isAdPlaying() {
  return !!document.querySelector('[data-a-target="video-ad-countdown"]');
}

function checkAd() {
  const adPlaying = isAdPlaying();

  if (adPlaying && !adIsPlaying) {
    // Ad just started
    adIsPlaying = true;
    if (twitchEnabled && adVolumeMode !== "off") {
      if (userPreferredVolume === null)
        userPreferredVolume = getVolume() || 0.5;

      let targetVol = 0;
      if (adVolumeMode === "quiet") targetVol = 0.2;
      else if (adVolumeMode === "mute") targetVol = 0;

      setVolume(targetVol);
      console.log(`Ad started: throttling volume to ${targetVol}`);
    }
  } else if (!adPlaying && adIsPlaying) {
    // Ad just ended
    adIsPlaying = false;
    if (
      twitchEnabled &&
      adVolumeMode !== "off" &&
      userPreferredVolume !== null
    ) {
      setVolume(userPreferredVolume);
      console.log(`Ad ended: restoring volume to ${userPreferredVolume}`);
    }
  }
}

function setup() {
  const slider = document.querySelector(volumeSliderSelector);
  if (slider) {
    slider.addEventListener("input", onUserVolumeChange);
  } else {
    console.warn("Volume slider not found at setup");
  }
  setInterval(checkAd, 1000);
}

setup();
