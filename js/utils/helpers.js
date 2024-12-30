"use strict";

/**
 * helpers.js
 * --------------------------------
 * Contains helper functions like formatting,
 * nested value retrieval, etc.
 */

/**
 * Retrieves the value from a nested object based on the provided path array.
 * Handles arrays and objects, converting the final value into a string.
 *
 * @param {object} obj - The source object from which to retrieve the value.
 * @param {string[]} pathArr - An array representing the path to the desired value.
 * @returns {string} - The retrieved value as a string, or an empty string if not found.
 */
function getNestedValue(obj, pathArr) {
  try {
    if (!obj || !pathArr || !Array.isArray(pathArr)) {
      console.warn('Invalid arguments provided to getNestedValue.');
      return '';
    }

    let current = obj;

    for (let i = 0; i < pathArr.length; i++) {
      const key = pathArr[i];
      if (current == null) {
        return '';
      }

      if (Array.isArray(current)) {
        current = current.map((item) => (item ? item[key] : undefined)).flat();
      } else {
        current = current[key];
      }
    }

    return convertToString(current);
  } catch (error) {
    console.error('Error in getNestedValue:', error);
    return '';
  }
}

/**
 * Recursively converts any given value (including arrays and objects) into a displayable string.
 *
 * @param {*} value - The value to be converted.
 * @returns {string} - The string representation of the input value.
 */
function convertToString(value) {
  try {
    if (Array.isArray(value)) {
      return value
          .map((v) => convertToString(v))
          .filter((v) => v !== undefined && v !== null && v !== '')
          .join(', ');
    } else if (value && typeof value === 'object') {
      // Customize this if you want specific object fields to be displayed
      return JSON.stringify(value);
    } else if (value == null) {
      return '';
    } else {
      return value.toString();
    }
  } catch (error) {
    console.error('Error in convertToString:', error);
    return '';
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