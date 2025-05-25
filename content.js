// content.js

let twitchEnabled = true; // default
let userPreferredVolume = null;
let autoThrottleEnabled = true;
const volumeSliderSelector = 'input[data-a-target="player-volume-slider"]';

// Request current twitchEnabled from background on load
chrome.runtime.sendMessage({ type: "getTwitchEnabled" }, (response) => {
  if (response && typeof response.value === "boolean") {
    twitchEnabled = response.value;
    console.log("Initial twitchEnabled:", twitchEnabled);
  }
});

// Listen for updates from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "updateTwitchEnabled") {
    twitchEnabled = message.value;
    console.log("twitchEnabled updated to:", twitchEnabled);
  }
});

function setVolume(volume) {
  const slider = document.querySelector(volumeSliderSelector);
  if (slider) {
    slider.value = volume;
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("Volume set to", volume);
  }
}

function getVolume() {
  const slider = document.querySelector(volumeSliderSelector);
  return slider ? parseFloat(slider.value) : null;
}

function setupUserVolumeListener() {
  const slider = document.querySelector(volumeSliderSelector);
  if (!slider) {
    console.warn("Volume slider not found, cannot listen for user input");
    return;
  }

  slider.addEventListener("input", () => {
    userPreferredVolume = parseFloat(slider.value);
    autoThrottleEnabled = false;
    console.log("User changed volume to", userPreferredVolume);

    clearTimeout(window.volumeThrottleTimeout);
    window.volumeThrottleTimeout = setTimeout(() => {
      autoThrottleEnabled = true;
      console.log("Auto throttle re-enabled");
    }, 15000);
  });
}

function isAdPlaying() {
  if (document.querySelector('[data-a-target="video-ad-countdown"]'))
    return true;
  if (document.querySelector(".player-ad-overlay")) return true;
  if (document.querySelector(".ad-banner")) return true;
  return false;
}

function throttleVolumeDuringAd() {
  if (!twitchEnabled) return;
  if (!autoThrottleEnabled) return;

  if (userPreferredVolume === null) {
    userPreferredVolume = getVolume() || 0.5;
  }
  setVolume(userPreferredVolume);
  console.log("Auto throttling volume to", userPreferredVolume);
}

function checkForAdAndThrottle() {
  if (isAdPlaying()) {
    console.log("Ad detected — throttling volume");
    throttleVolumeDuringAd();
  }
}

function init() {
  console.log("Content script loaded");
  setupUserVolumeListener();
  setInterval(checkForAdAndThrottle, 1000);
}

init();
