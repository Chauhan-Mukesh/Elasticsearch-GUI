"use strict";

/**
 * preferences.js
 * --------------------------------
 * Manages user preferences, such as filters,
 * column settings, page size, or visualization parameters.
 *
 * This version demonstrates:
 * 1. Saving and loading user preferences from localStorage.
 * 2. A function to apply loaded preferences to the UI on startup.
 */

// A global object to store all preferences in-memory before saving.
let userPreferences = {
  selectedColumns: [],    // e.g., ["field1", "field2"]
  columnAliases: {},      // e.g., { "field1": "MyField1" }
  filters: {},            // The currentFilters object from dataGrid
  pageSize: 10,           // The current page size
  language: "en",         // Default language
  darkMode: "disabled",   // or "enabled"
};

/**
 * loadUserPreferences
 * -------------------
 * Reads preferences from localStorage, merges them into the global userPreferences object,
 * and then applies them to the application (e.g., reselect columns, restore filters).
 */
function loadUserPreferences() {
  try {
    const savedPrefs = localStorage.getItem("esGuiUserPreferences");
    if (savedPrefs) {
      // Merge the saved prefs into the global userPreferences
      const parsedPrefs = JSON.parse(savedPrefs);
      Object.assign(userPreferences, parsedPrefs);
    }
    applyUserPreferences();
  } catch (err) {
    console.error("Error loading user preferences:", err);
  }
}

/**
 * saveUserPreferences
 * -------------------
 * Persists the current userPreferences object to localStorage.
 */
function saveUserPreferences() {
  try {
    localStorage.setItem("esGuiUserPreferences", JSON.stringify(userPreferences));
    showNotification("Preferences saved successfully.", "success");
  } catch (err) {
    console.error("Error saving user preferences:", err);
    showNotification("Error saving preferences: " + err.message, "danger");
  }
}

/**
 * applyUserPreferences
 * --------------------
 * Applies the loaded preferences to the UI, including:
 * - Reapplying column selection & aliases
 * - Re-setting filters
 * - Adjusting page size
 * - Setting dark mode, language, etc.
 */
function applyUserPreferences() {
  // 1. Reapply selected columns and aliases
  if (userPreferences.selectedColumns && userPreferences.selectedColumns.length) {
    // In dataGrid.js, we keep track of 'columnAliases' globally
    columnAliases = userPreferences.columnAliases || {};
    
    // We also need to re-populate the #selectedFields list.
    // For simplicity, we can do this only after the mapping is loaded
    // (e.g., from dataGrid's flattenMapping). That might happen automatically
    // if you reload the page after connecting to the same index.
  }

  // 2. Reapply current filters
  if (userPreferences.filters) {
    currentFilters = userPreferences.filters;
  }

  // 3. Reapply page size
  if (userPreferences.pageSize) {
    pageSize = userPreferences.pageSize;
    const pageSizeSelect = document.getElementById("pageSizeSelect");
    if (pageSizeSelect) {
      pageSizeSelect.value = pageSize;
    }
  }

  // 4. Dark mode
  if (userPreferences.darkMode === "enabled") {
    document.body.classList.add("dark-mode");
    const toggle = document.getElementById("darkModeToggle");
    if (toggle) toggle.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
  }

  // 5. Language
  if (userPreferences.language) {
    setLanguage(userPreferences.language);
  }
}

/**
 * updateUserPreferences
 * ---------------------
 * Updates the global userPreferences object based on the current state
 * (e.g., filters, columns), and optionally saves them immediately.
 * This is called whenever the user changes columns, filters, etc.
 */
function updateUserPreferences(options = { autoSave: false }) {
  // 1. Save current filters
  userPreferences.filters = currentFilters;

  // 2. Save selected columns & aliases
  userPreferences.selectedColumns = getSelectedColumns();
  userPreferences.columnAliases = columnAliases;

  // 3. Save current page size
  userPreferences.pageSize = pageSize;

  // 4. Save current dark mode setting
  userPreferences.darkMode = document.body.classList.contains("dark-mode")
    ? "enabled"
    : "disabled";

  // 5. Save current language
  userPreferences.language = currentLanguage;

  if (options.autoSave) {
    saveUserPreferences();
  }
}
