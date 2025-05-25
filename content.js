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

// Listen for changes to twitchEnabled setting
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.twitchEnabled) {
    twitchEnabled = changes.twitchEnabled.newValue;
    console.log("Twitch throttle enabled updated:", twitchEnabled);
  }
});

// Set volume slider value and trigger input event to update Twitch player
function setVolume(volume) {
  const slider = document.querySelector(volumeSliderSelector);
  if (slider) {
    slider.value = volume;
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// Get current volume from slider
function getVolume() {
  const slider = document.querySelector(volumeSliderSelector);
  return slider ? parseFloat(slider.value) : null;
}

// Listen for manual user changes on the volume slider
function setupUserVolumeListener() {
  const slider = document.querySelector(volumeSliderSelector);
  if (!slider) return;

  slider.addEventListener("input", () => {
    userPreferredVolume = parseFloat(slider.value);
    autoThrottleEnabled = false; // Disable auto throttling on manual change
    console.log("User changed volume to", userPreferredVolume);

    // Re-enable auto throttling after 15 seconds of no manual changes
    clearTimeout(window.volumeThrottleTimeout);
    window.volumeThrottleTimeout = setTimeout(() => {
      autoThrottleEnabled = true;
      console.log("Auto throttle re-enabled");
    }, 15000);
  });
}

// When an ad is detected, throttle volume back to preferred if auto throttle is enabled and twitchEnabled is true
function throttleVolumeDuringAd() {
  if (!twitchEnabled) return; // Check if toggle enabled
  if (!autoThrottleEnabled) return;

  if (userPreferredVolume === null) {
    userPreferredVolume = getVolume() || 0.5; // fallback default if none saved
  }
  setVolume(userPreferredVolume);
  console.log("Auto throttling volume to", userPreferredVolume);
}

// Check if an ad is currently playing by detecting ad countdown element
function checkForAdAndThrottle() {
  const adElement = document.querySelector(
    '[data-a-target="video-ad-countdown"]'
  );
  if (adElement) {
    throttleVolumeDuringAd();
  }
}

// Initialize script
function init() {
  setupUserVolumeListener();

  // Periodically check for ads every second
  setInterval(checkForAdAndThrottle, 1000);
}

// Run
init();
