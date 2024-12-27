"use strict";

/**
 * errorHandling.js
 * --------------------------------
 * Provides functions for centralized error handling,
 * logging, and displaying user-friendly messages.
 */

/**
 * Displays or logs a critical error message.
 * 
 * @param {Error|string} err - Error object or message.
 * @param {string} userMessage - A user-friendly message to display.
 */
function handleCriticalError(err, userMessage = "An error occurred.") {
  console.error("CRITICAL ERROR:", err);

  // Optionally, we can show an on-screen alert if desired
  showNotification(userMessage, "danger");
}
