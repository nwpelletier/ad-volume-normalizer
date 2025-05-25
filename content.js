let twitchEnabled = true; // default enabled
let userPreferredVolume = null;
let autoThrottleEnabled = true;
const volumeSliderSelector = 'input[data-a-target="player-volume-slider"]';

// Load twitchEnabled from storage on start
chrome.storage.sync.get(["twitchEnabled"], (data) => {
  if (data.twitchEnabled !== undefined) {
    twitchEnabled = data.twitchEnabled;
    console.log("Twitch throttle enabled:", twitchEnabled);
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.twitchEnabled) {
    twitchEnabled = changes.twitchEnabled.newValue;
    console.log("Twitch throttle enabled updated:", twitchEnabled);
  }
});

function setVolume(volume) {
  const slider = document.querySelector(volumeSliderSelector);
  if (slider) {
    slider.value = volume;
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("Volume set to", volume);
  } else {
    console.warn("Volume slider not found");
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
    autoThrottleEnabled = false; // Disable auto throttling on manual change
    console.log("User changed volume to", userPreferredVolume);

    clearTimeout(window.volumeThrottleTimeout);
    window.volumeThrottleTimeout = setTimeout(() => {
      autoThrottleEnabled = true;
      console.log("Auto throttle re-enabled");
    }, 15000);
  });
}

// Try multiple selectors for ad detection, fallback method
function isAdPlaying() {
  // Primary selector: video ad countdown
  if (document.querySelector('[data-a-target="video-ad-countdown"]')) {
    return true;
  }
  // Backup selector: ad container or overlay Twitch may use (update if needed)
  if (
    document.querySelector(".player-ad-overlay") ||
    document.querySelector(".ad-banner")
  ) {
    return true;
  }
  return false;
}

function throttleVolumeDuringAd() {
  if (!twitchEnabled) {
    console.log("Throttle skipped: twitchEnabled is false");
    return;
  }
  if (!autoThrottleEnabled) {
    console.log("Throttle skipped: autoThrottle disabled by user");
    return;
  }

  if (userPreferredVolume === null) {
    userPreferredVolume = getVolume() || 0.5; // fallback default
    console.log("Using fallback userPreferredVolume:", userPreferredVolume);
  }
  setVolume(userPreferredVolume);
  console.log("Auto throttling volume to", userPreferredVolume);
}

function checkForAdAndThrottle() {
  if (isAdPlaying()) {
    console.log("Ad detected — throttling volume");
    throttleVolumeDuringAd();
  } else {
    // Optional: you can log ad absence here but it may spam console
    // console.log("No ad detected");
  }
}

function init() {
  console.log("Content script loaded");
  setupUserVolumeListener();
  setInterval(checkForAdAndThrottle, 1000);
}

init();
