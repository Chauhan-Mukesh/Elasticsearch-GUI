"use strict";

/**
 * app.js
 * --------------------------------
 * Main entry point that initializes event listeners,
 * handles dark mode/contrast, and orchestrates modules.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Preferences
  initializeDarkModeToggle();
  initializeContrastSelector();

  // Initialize Connection Form
  initializeConnectionForm();

  // Initialize Data Grid Controls
  initializeDataGridControls();

  // Initialize Visualization Controls
  initializeVisualizationControls();

  // Initialize Onboarding
  initializeOnboarding();

  // Initialize Localization
  loadLocalization();

  // Load user preferences from local storage or server
  loadUserPreferences();
});

/* ================== DARK MODE & CONTRAST ================== */

function initializeDarkModeToggle() {
  const toggle = document.getElementById("darkModeToggle");
  // Check local storage for theme preference
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  });
}

function initializeContrastSelector() {
  const contrastSlider = document.getElementById("contrastLevel");
  const savedContrast = localStorage.getItem("contrastLevel") || "1";
  contrastSlider.value = savedContrast;
  applyContrastLevel(savedContrast);

  contrastSlider.addEventListener("input", () => {
    const selectedContrast = contrastSlider.value;
    applyContrastLevel(selectedContrast);
    localStorage.setItem("contrastLevel", selectedContrast);
  });
}

function applyContrastLevel(level) {
  document.documentElement.style.setProperty("--contrast-level", level);
}

/* ================== LOADING INDICATOR ================== */

function showLoadingIndicator(show) {
  if (show) {
    if (!document.getElementById("loadingIndicator")) {
      const loader = document.createElement("div");
      loader.id = "loadingIndicator";
      loader.innerHTML = `
        <div class="d-flex justify-content-center align-items-center"
             style="position: fixed; top: 50%; left: 50%;
                    transform: translate(-50%, -50%); z-index: 2000;">
          <div class="spinner-border text-primary" role="status" aria-label="Loading">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `;
      document.body.appendChild(loader);
    }
  } else {
    const loader = document.getElementById("loadingIndicator");
    if (loader) {
      loader.remove();
    }
  }
}
