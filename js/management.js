"use strict";

/**
 * management.js
 * --------------------------------
 * Handles index and field management (creation, deletion, updates).
 *
 * This version demonstrates:
 * 1. Creating a new index with basic settings.
 * 2. Deleting an index.
 * 3. Refreshing or reloading the list of indices.
 *
 * In your UI, you can add buttons or forms to trigger these functions.
 */

function createIndex(indexName, settings = {}) {
  if (!esUrl) {
    showNotification("Please connect first.", "warning");
    return;
  }
  if (!indexName) {
    showNotification("Index name is required.", "warning");
    return;
  }

  // Basic example: create an index with optional settings/mappings
  const url = `${esUrl}/${indexName}`;
  fetch(url, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(settings), // e.g. { settings: {...}, mappings: {...} }
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to create index. Status: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => {
      showNotification(`Index '${indexName}' created successfully!`, "success");
      // Refresh the list of indices
      loadIndicesData();
    })
    .catch((err) => {
      console.error(err);
      showNotification(`Error creating index: ${err.message}`, "danger");
    });
}

function deleteIndex(indexName) {
  if (!esUrl) {
    showNotification("Please connect first.", "warning");
    return;
  }
  if (!indexName) {
    showNotification("Index name is required to delete.", "warning");
    return;
  }

  const url = `${esUrl}/${indexName}`;
  fetch(url, {
    method: "DELETE",
    headers: buildHeaders(),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to delete index. Status: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => {
      showNotification(`Index '${indexName}' deleted successfully!`, "success");
      // Refresh list of indices
      loadIndicesData();
    })
    .catch((err) => {
      console.error(err);
      showNotification(`Error deleting index: ${err.message}`, "danger");
    });
}

/**
 * refreshIndexList
 * ----------------
 * Simple convenience function to re-fetch the index list
 * and refresh the dropdown.
 */
function refreshIndexList() {
  if (!esUrl) {
    showNotification("Please connect first.", "warning");
    return;
  }
  loadIndicesData();
  showNotification("Index list refreshed.", "info");
}

/**
 * initializeManagementUI
 * ----------------------
 * (Optional) Provide a way to attach these features to actual UI elements.
 * For instance, if you have a form or modal for creating/deleting an index,
 * you can wire them up here.
 */
function initializeManagementUI() {
  // Example usage:
  // document.getElementById("createIndexBtn").addEventListener("click", () => {
  //   const indexName = document.getElementById("newIndexName").value.trim();
  //   createIndex(indexName);
  // });

  // document.getElementById("deleteIndexBtn").addEventListener("click", () => {
  //   const indexName = document.getElementById("deleteIndexName").value.trim();
  //   deleteIndex(indexName);
  // });

  // document.getElementById("refreshIndicesBtn").addEventListener("click", () => {
  //   refreshIndexList();
  // });
}
