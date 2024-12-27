"use strict";

/**
 * helpers.js
 * --------------------------------
 * Contains helper functions like formatting,
 * nested value retrieval, etc.
 */

/**
 * A truly generic getNestedValue that:
 * 1. Walks down each key in pathArr.
 * 2. If at any step it's an array, we map over each item and continue.
 * 3. Finally returns either a string or a primitive, so you can display it easily.
 */
function getNestedValue(obj, pathArr) {
  // We'll traverse down obj step by step according to pathArr
  let current = obj;

  for (let i = 0; i < pathArr.length; i++) {
    const key = pathArr[i];
    if (current == null) {
      // If current is null or undefined, no more to traverse
      return undefined;
    }

    if (Array.isArray(current)) {
      // If current is an array, we want to gather the results from each item
      // For instance, if current = [ {...}, {...} ], we do item[key]
      current = current.map((item) => {
        if (item == null) return undefined;
        return item[key];
      });
    } else {
      // Not an array, just descend one level
      current = current[key];
    }
  }

  // Now we've resolved the path to `current`, which could be:
  //  - a primitive (string, number, boolean)
  //  - an array of something
  //  - an object
  // We'll convert it into a displayable string generically.

  return convertToString(current);
}

/**
 * convertToString - Recursively convert any array/object to a string for display
 */
function convertToString(value) {
  if (Array.isArray(value)) {
    // Map each element to a string, then join
    return value
        .map((v) => convertToString(v))
        .filter((v) => v !== undefined && v !== null && v !== "")
        .join(", ");
  } else if (value && typeof value === "object") {
    // If it's an object, we could do a short JSON.stringify or something
    // For a fully generic approach, let's just JSON.stringify it.
    return JSON.stringify(value);
  } else if (value == null) {
    return "";
  } else {
    // string, number, boolean, etc.
    return value.toString();
  }
}

/**
 * Debounce utility to limit function execution rate.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The debounce delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * showNotification displays a floating message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - Alert type (success, danger, warning, info).
 */
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-2`;
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  notification.appendChild(alertDiv);

  // Automatically remove the notification after 5 seconds
  setTimeout(() => {
    if (alertDiv) {
      alertDiv.classList.remove("show");
      alertDiv.classList.add("hide");
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.parentNode.removeChild(alertDiv);
        }
      }, 500);
    }
  }, 5000);
}

function getNestedPath(field) {
  const parts = field.split(".");
  for (let i = parts.length - 1; i > 0; i--) {
    const possiblePath = parts.slice(0, i).join(".");
    if (fieldTypes[possiblePath] === "nested") {
      return possiblePath;
    }
  }
  return null;
}