"use strict";

/**
 * localization.js
 * --------------------------------
 * Provides multi-language support.
 *
 * This version:
 * 1. Keeps a dictionary of translations for a couple of languages (EN, ES).
 * 2. Allows switching the current language at runtime.
 * 3. Dynamically updates elements with a [data-i18n] attribute.
 */

// Current language preference
let currentLanguage = "en";

// Example dictionary of translations
const translations = {
  en: {
    "nav.brand": "Elasticsearch GUI",
    "connection.title": "Connection",
    "indexManagement.title": "Index Management",
    "dataGrid.title": "Data Grid",
    "visualization.title": "Data Visualizations",
    "export.csv": "Export CSV",
    "export.json": "Export JSON",
    "export.excel": "Export Excel",
    "export.pdf": "Export PDF",
    "columns.select": "Select Columns",
    // ... Add more keys as needed
  },
  es: {
    "nav.brand": "Interfaz Elasticsearch",
    "connection.title": "Conexión",
    "indexManagement.title": "Gestión de Índices",
    "dataGrid.title": "Tabla de Datos",
    "visualization.title": "Visualizaciones de Datos",
    "export.csv": "Exportar CSV",
    "export.json": "Exportar JSON",
    "export.excel": "Exportar Excel",
    "export.pdf": "Exportar PDF",
    "columns.select": "Seleccionar Columnas",
    // ... Add more keys as needed
  },
};

/**
 * loadLocalization
 * ----------------
 * Called at app start to check or set a default language
 * (this logic could be more advanced, e.g. auto-detecting user locale).
 */
function loadLocalization() {
  // If you want to auto-detect:
  // const userLang = navigator.language.substring(0, 2);
  // if (translations[userLang]) currentLanguage = userLang;
  applyTranslations();
}

/**
 * setLanguage
 * -----------
 * Switches the current language and updates the UI.
 */
function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    applyTranslations();
    // Also update userPreferences if using preferences
    if (userPreferences) {
      userPreferences.language = lang;
      saveUserPreferences();
    }
  } else {
    console.warn(`Language '${lang}' not found in translations.`);
  }
}

/**
 * applyTranslations
 * -----------------
 * Finds all elements with [data-i18n="some.key"] and updates their textContent
 * to the localized string for the current language.
 */
function applyTranslations() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      el.textContent = translations[currentLanguage][key];
    }
  });
}
