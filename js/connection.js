"use strict";

/**
 * connection.js
 * --------------------------------
 * Handles Elasticsearch connection logic, 
 * including form submission, retries, refresh, etc.
 */

let esUrl = "";
let esUser = "";
let esPass = "";

/**
 * Initialize connection form event listener.
 */
function initializeConnectionForm() {
  const connectionForm = document.getElementById("connectionForm");
  connectionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    esUrl = document.getElementById("esUrl").value.trim();
    esUser = document.getElementById("username").value.trim();
    esPass = document.getElementById("password").value.trim();

    if (!esUrl) {
      showNotification("Elasticsearch URL is required.", "danger");
      return;
    }

    await connectToElasticsearch();
  });
}

/**
 * Connect to Elasticsearch and handle errors.
 */
async function connectToElasticsearch() {
  try {
    showLoadingIndicator(true);
    await loadClusterInfo();
    await loadAllClusterData();
    showNotification("Connected successfully!", "success");
  } catch (error) {
    handleCriticalError(error, "Failed to connect to Elasticsearch.");
  } finally {
    showLoadingIndicator(false);
  }
}

/**
 * Load basic cluster info.
 */
async function loadClusterInfo() {
  const res = await fetch(esUrl, { method: "GET", headers: buildHeaders() });
  if (!res.ok) throw new Error("Failed to load cluster info");
  const data = await res.json();
  document.getElementById("clusterInfo").textContent =
    "Connected to cluster: " + (data.cluster_name || "N/A");
}

/**
 * Build request headers, including Basic Auth if provided.
 */
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (esUser && esPass) {
    headers["Authorization"] = "Basic " + btoa(esUser + ":" + esPass);
  }
  return headers;
}

/**
 * Load all cluster data (indices, etc.).
 */
async function loadAllClusterData() {
  await loadIndicesData();
}

/**
 * Fetch list of indices from ES.
 */
async function loadIndicesData() {
  const res = await fetch(`${esUrl}/_cat/indices?format=json`, {
    method: "GET",
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch indices");
  const data = await res.json();
  populateIndexSelect(data);
  showNotification("Indices loaded successfully!", "success");
}

/**
 * Populate index select dropdown.
 */
function populateIndexSelect(data) {
  const sel = document.getElementById("indexSelect");
  sel.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "-- Select an Index --";
  sel.appendChild(defaultOpt);

  data.forEach((idx) => {
    const opt = document.createElement("option");
    opt.value = idx.index;
    opt.textContent = idx.index;
    sel.appendChild(opt);
  });
}
