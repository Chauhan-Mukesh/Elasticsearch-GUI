"use strict";

/**
 * dataGrid.js
 * --------------------------------
 * Manages display of Elasticsearch data in a dynamic,
 * paginated, and filterable grid.
 */

let selectedIndex = "";
let flattenedFields = [];
let fieldTypes = {};
let currentPage = 0;
let pageSize = 10;
let currentHits = [];
let selectedColumnsOrder = [];

// For column aliases and filters
let columnAliases = {};
let currentFilters = {};

/**
 * Initialize data grid controls.
 */
function initializeDataGridControls() {
  document
    .getElementById("indexSelect")
    .addEventListener("change", async () => {
      selectedIndex = document.getElementById("indexSelect").value;
      if (!selectedIndex) return;
      await resetUIOnIndexChange();
      await loadMapping(selectedIndex);
      currentPage = 0;
      await searchElasticsearch(false, true);
    });

  // Pagination
  document.getElementById("prevPageBtn").addEventListener("click", async () => {
    if (currentPage > 0) {
      currentPage--;
      await searchElasticsearch();
    }
  });

  document.getElementById("nextPageBtn").addEventListener("click", async () => {
    currentPage++;
    await searchElasticsearch();
  });

  // Page Size
  document
    .getElementById("pageSizeSelect")
    .addEventListener("change", async (e) => {
      pageSize = parseInt(e.target.value, 10);
      currentPage = 0;
      console.log("Updated pageSize to:", pageSize);
      await searchElasticsearch();
    });

  // Column Modal
  document
    .getElementById("selectColumnsBtn")
    .addEventListener("click", () => {
      const columnModal = new bootstrap.Modal(
        document.getElementById("columnModal")
      );
      populateFieldLists();
      columnModal.show();
    });

  document
    .getElementById("moveToSelected")
    .addEventListener("click", () => {
      moveSelectedItems("#availableFields", "#selectedFields", true);
    });

  document
    .getElementById("moveToAvailable")
    .addEventListener("click", () => {
      moveSelectedItems("#selectedFields", "#availableFields", false);
    });

  document
    .getElementById("saveColumnsBtn")
    .addEventListener("click", async () => {
      // 1. Read the final order from the DOM
      const listItems = document.querySelectorAll("#selectedFields li");
      selectedColumnsOrder = Array.from(listItems).map(li => {
        // 'span' text is the actual field name
        const span = li.querySelector("span");
        return span ? span.textContent : li.textContent.trim();
      });

      // 2. Now we hide the modal
      const columnModal = bootstrap.Modal.getInstance(
          document.getElementById("columnModal")
      );
      columnModal.hide();
      currentPage = 0;
      await searchElasticsearch();
    });

  document
      .getElementById("resetFiltersBtn")
      .addEventListener("click", async () => {
        // 1. Clear all filter states
        currentFilters = {};

        // 2. Reset to first page
        currentPage = 0;

        // 3. Re-run the search, which will re-draw the table & filter row
        await searchElasticsearch(false, true);

        // Optional: show a small notice
        showNotification("All filters have been reset.", "info");
      });

}

/**
 * Reset UI when index changes.
 */
async function resetUIOnIndexChange() {
  currentFilters = {};
  columnAliases = {};
  selectedColumnsOrder = [];
  $("#selectedFields").empty();
  $("#availableFields").empty();
  document.getElementById("resultsHeader").innerHTML = "";
  document.getElementById("resultsBody").innerHTML = "";
  document.getElementById("pageInfo").textContent = "";
}

/**
 * Load and flatten mapping for the selected index.
 */
async function loadMapping(idx) {
  try {
    showLoadingIndicator(true);
    const res = await fetch(`${esUrl}/${idx}/_mapping`, {
      method: "GET",
      headers: buildHeaders(),
    });
    if (!res.ok) throw new Error("Mapping request failed");
    const mappingData = await res.json();
    const props = mappingData[idx]?.mappings?.properties || {};
    flattenedFields = [];
    fieldTypes = {};
    flattenMapping(props, "");
    displayMappingTable(props);
    showNotification("Mapping loaded successfully!", "success");
    // Initial fetch
    await searchElasticsearch(false, true);
  } catch (err) {
    console.error(err);
    showNotification("Error loading mapping: " + err.message, "danger");
  } finally {
    showLoadingIndicator(false);
  }
}

/**
 * Display the mapping in a table.
 */
function displayMappingTable(props) {
  const tbody = document.querySelector("#mappingTable tbody");
  tbody.innerHTML = "";
  for (const field in props) {
    if (!props.hasOwnProperty(field)) continue;
    const type = props[field].type || "object/nested";
    const tr = document.createElement("tr");
    const tdField = document.createElement("td");
    tdField.textContent = field;
    const tdType = document.createElement("td");
    tdType.textContent = type;
    tr.appendChild(tdField);
    tr.appendChild(tdType);
    tbody.appendChild(tr);
  }
}

/**
 * Flatten mapping into a single array of field paths.
 */
function flattenMapping(obj, parentPath) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const fullPath = parentPath ? parentPath + "." + key : key;

    let fieldType;
    if (obj[key]?.type === "nested") {
      fieldType = "nested";
    } else if (obj[key]?.type) {
      fieldType = obj[key].type;
    } else if (obj[key]?.properties) {
      fieldType = "object";
    } else {
      fieldType = undefined;
    }

    fieldTypes[fullPath] = fieldType || "object"; // Default to object if type unspecified
    flattenedFields.push(fullPath);

    // If nested or object, recurse into properties
    if (fieldType === "object" || fieldType === "nested") {
      if (obj[key].properties) {
        flattenMapping(obj[key].properties, fullPath);
      }
    }
  }
}

/**
 * Build and execute search query.
 */
async function searchElasticsearch(isExport = false, isInitial = false) {
  if (!selectedIndex) {
    showNotification("Please select an index.", "warning");
    return;
  }
  const size = isExport ? 10000 : undefined;
  const queryObj = buildQuery(size, isInitial);
  try {
    showLoadingIndicator(true);
    const res = await fetch(`${esUrl}/${selectedIndex}/_search`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(queryObj),
    });
    if (!res.ok) throw new Error("Search request failed: " + res.statusText);
    const data = await res.json();

    if (isExport) {
      return data.hits?.hits || [];
    } else {
      currentHits = data.hits?.hits || [];
      drawResultsTable(currentHits, data.hits?.total?.value || currentHits.length);
      if (Object.keys(currentFilters).length && !isInitial) {
        showNotification("Data fetched with applied filters!", "success");
      } else if (!isInitial) {
        showNotification("Data fetched successfully!", "success");
      }
    }
  } catch (err) {
    console.error(err);
    showNotification("Error fetching data: " + err.message, "danger");
    if (isExport) return [];
  } finally {
    showLoadingIndicator(false);
  }
}

/**
 * Constructs an Elasticsearch query object based on current filters.
 * Handles both nested and non-nested fields, supporting various operators.
 *
 * @param {number} [overrideSize] - Optional size override for the query.
 * @param {boolean} [isInitial=false] - Flag indicating if this is the initial query.
 * @returns {object} - The constructed Elasticsearch query object.
 */
function buildQuery(overrideSize, isInitial = false) {
  try {
    // Validate essential variables
    if (typeof fieldTypes === 'undefined') {
      throw new Error('fieldTypes is not defined.');
    }
    if (typeof currentFilters === 'undefined') {
      throw new Error('currentFilters is not defined.');
    }

    const mustClauses = [];

    // Iterate over each filter to construct query clauses
    for (const field in currentFilters) {
      if (!Object.prototype.hasOwnProperty.call(currentFilters, field)) {
        continue;
      }

      const filter = currentFilters[field];
      const fieldType = fieldTypes[field];
      let matchQuery = {};

      // Determine if the field is within a nested path
      const nestedPath = getNestedPath(field);
      const isNested = nestedPath !== null;

      if (isNested) {
        const relativeField = field.substring(nestedPath.length + 1); // Remove 'ServiceTiers.' prefix

        if (filter.operator === 'contains' && filter.value) {
          matchQuery = {
            nested: {
              path: nestedPath,
              query: {
                // Using query_string allows partial/wildcard-like behavior on analyzed fields
                query_string: {
                  query: `*${filter.value}*`,
                  default_field: `${nestedPath}.${relativeField}`
                }
              }
            }
          };
        } else if (filter.operator === 'equals' && filter.value) {
          matchQuery = {
            nested: {
              path: nestedPath,
              query: {
                match_phrase: {
                  [`${relativeField}`]: filter.value
                }
              }
            }
          };
        }
      } else {
        // Handle non-nested fields
        switch (fieldType) {
          case 'text': {
            const keywordField = `${field}.keyword`;
            if (fieldTypes[keywordField] === 'keyword') {
              // If .keyword subfield exists, use it for exact/wildcard searches
              if (filter.operator === 'contains' && filter.value) {
                matchQuery = {
                  wildcard: {
                    [keywordField]: `*${filter.value}*`,
                  },
                };
              } else if (filter.operator === 'equals' && filter.value) {
                matchQuery = {
                  term: {
                    [keywordField]: filter.value,
                  },
                };
              }
            } else {
              // If no .keyword subfield, use match_phrase for exact matches
              if (filter.operator === 'contains' && filter.value) {
                // 'contains' can be interpreted as a full-text search
                matchQuery = {
                  match: {
                    [field]: {
                      query: filter.value,
                      operator: 'and',
                    },
                  },
                };
              } else if (filter.operator === 'equals' && filter.value) {
                matchQuery = {
                  match_phrase: {
                    [field]: filter.value,
                  },
                };
              }
            }
            break;
          }

          case 'keyword': {
            if (filter.operator === 'contains' && filter.value) {
              matchQuery = {
                wildcard: {
                  [field]: `*${filter.value}*`,
                },
              };
            } else if (filter.operator === 'equals' && filter.value) {
              matchQuery = {
                term: {
                  [field]: filter.value,
                },
              };
            }
            break;
          }

          case 'integer':
          case 'long':
          case 'float':
          case 'double': {
            if (filter.operator === 'exact' && filter.value !== undefined && filter.value !== '') {
              const numericValue = Number(filter.value);
              if (isNaN(numericValue)) {
                console.warn(`Invalid numeric value for field ${field}: ${filter.value}`);
                continue;
              }
              matchQuery = {
                term: {
                  [field]: numericValue,
                },
              };
            } else if (filter.operator === 'range') {
              const range = {};
              if (filter.min !== '') {
                const min = Number(filter.min);
                if (!isNaN(min)) {
                  range.gte = min;
                }
              }
              if (filter.max !== '') {
                const max = Number(filter.max);
                if (!isNaN(max)) {
                  range.lte = max;
                }
              }
              if (Object.keys(range).length > 0) {
                matchQuery = {
                  range: {
                    [field]: range,
                  },
                };
              }
            }
            break;
          }

          case 'date': {
            const range = {};
            if (filter.start !== '') {
              range.gte = filter.start;
            }
            if (filter.end !== '') {
              range.lte = filter.end;
            }
            if (Object.keys(range).length > 0) {
              matchQuery = {
                range: {
                  [field]: range,
                },
              };
            }
            break;
          }

          case 'object': {
            // Assuming 'object' fields might have a .keyword subfield
            const keywordField = `${field}.keyword`;
            if (fieldTypes[keywordField] === 'keyword') {
              if (filter.operator === 'contains' && filter.value) {
                matchQuery = {
                  wildcard: {
                    [keywordField]: `*${filter.value}*`,
                  },
                };
              } else if (filter.operator === 'equals' && filter.value) {
                matchQuery = {
                  term: {
                    [keywordField]: filter.value,
                  },
                };
              }
            } else {
              // Fallback for object fields without .keyword
              if (filter.operator === 'contains' && filter.value) {
                matchQuery = {
                  match: {
                    [field]: {
                      query: filter.value,
                      operator: 'and',
                    },
                  },
                };
              } else if (filter.operator === 'equals' && filter.value) {
                matchQuery = {
                  match_phrase: {
                    [field]: filter.value,
                  },
                };
              }
            }
            break;
          }

          default:
            console.warn(`Unhandled field type '${fieldType}' for field '${field}'.`);
        }
      }

      // Add the constructed match query to must clauses if valid
      if (Object.keys(matchQuery).length > 0) {
        mustClauses.push(matchQuery);
      }
    }

    // Construct the final query object
    const finalQuery = {
      from: overrideSize !== undefined ? 0 : currentPage * pageSize,
      size: overrideSize !== undefined ? overrideSize : pageSize,
      query: {
        bool: {
          must: mustClauses.length > 0 ? mustClauses : { match_all: {} },
        },
      },
    };

    if (mustClauses.length === 0 && !isInitial) {
      showNotification('No filters applied. Showing default results.', 'info');
    }

    console.debug('Constructed Elasticsearch Query:', JSON.stringify(finalQuery, null, 2));
    return finalQuery;
  } catch (error) {
    console.error('Error in buildQuery:', error);
    showNotification(`Error building query: ${error.message}`, 'danger');
    // Return a default match_all query to prevent application crash
    return {
      from: overrideSize !== undefined ? 0 : currentPage * pageSize,
      size: overrideSize !== undefined ? overrideSize : pageSize,
      query: {
        match_all: {},
      },
    };
  }
}

/**
 * Retrieves the nested path for a given field based on fieldTypes.
 *
 * @param {string} field - The full field path (e.g., "ServiceTiers.LegacyNpiCode").
 * @returns {string|null} - The nested path (e.g., "ServiceTiers") or null if not found.
 */
function getNestedPath(field) {
  try {
    if (!field || typeof field !== 'string') {
      console.warn('Invalid field provided to getNestedPath.');
      return null;
    }

    const parts = field.split('.');
    for (let i = parts.length; i > 0; i--) {
      const possiblePath = parts.slice(0, i).join('.');
      if (fieldTypes[possiblePath] === 'nested') {
        return possiblePath;
      }
    }
    return null;
  } catch (error) {
    console.error('Error in getNestedPath:', error);
    return null;
  }
}

/**
 * Draw results table with data.
 */
function drawResultsTable(hits, total) {
  const tHead = document.getElementById("resultsHeader");
  const tBody = document.getElementById("resultsBody");
  tHead.innerHTML = "";
  tBody.innerHTML = "";

  const columns = getSelectedColumns();
  if (!columns.length) {
    if (currentPage === 0 && !currentHits.length) {
      return;
    } else {
      showNotification("No columns selected. Please select columns.", "warning");
      return;
    }
  }

  // Header row
  const headerRow = document.createElement("tr");
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = columnAliases[col] || col;
    headerRow.appendChild(th);
  });
  tHead.appendChild(headerRow);

  // Filter row
  const filterRow = document.createElement("tr");
  columns.forEach((col) => {
    const th = document.createElement("th");
    const fieldType = fieldTypes[col];
    let inputHtml = "";

    // Field-type-specific filter controls
    if (fieldType === "text" || fieldType === "keyword") {
      inputHtml = `
        <select class="form-select form-select-sm mb-1 filter-select" data-field="${col}">
          <option value="" ${(!currentFilters[col] || !currentFilters[col].operator) ? 'selected' : ''}>No Filter</option>
          <option value="contains" ${(currentFilters[col]?.operator === 'contains') ? 'selected' : ''}>Contains</option>
          <option value="equals"   ${(currentFilters[col]?.operator === 'equals')   ? 'selected' : ''}>Equals</option>
        </select>
        <input
          type="text"
          class="form-control form-control-sm filter-input"
          data-field="${col}"
          placeholder="Value"
          value="${currentFilters[col]?.value ?? ''}"
        />
      `;
    } else if (["integer", "long", "float", "double"].includes(fieldType)) {
      inputHtml = `
        <select class="form-select form-select-sm mb-1 filter-select" data-field="${col}" data-type="numeric">
          <option value="" ${!currentFilters[col] || !currentFilters[col].operator ? 'selected' : ''}>No Filter</option>
          <option value="exact" ${currentFilters[col]?.operator === 'exact' ? 'selected' : ''}>Exact Match</option>
          <option value="range" ${currentFilters[col]?.operator === 'range' ? 'selected' : ''}>Range</option>
        </select>
        <div class="numeric-filter-inputs">
          <input
            type="number"
            class="form-control form-control-sm filter-input"
            data-field="${col}"
            data-operator="exact"
            placeholder="Value"
            value="${(currentFilters[col]?.operator === 'exact') ? (currentFilters[col]?.value ?? '') : ''}"
          />
          <div class="range-inputs" style="display:${(currentFilters[col]?.operator === 'range') ? 'block' : 'none'};">
            <input
              type="number"
              class="form-control form-control-sm filter-input"
              data-field="${col}"
              data-operator="range-min"
              placeholder="Min"
              value="${currentFilters[col]?.min ?? ''}"
            />
            <input
              type="number"
              class="form-control form-control-sm filter-input mt-1"
              data-field="${col}"
              data-operator="range-max"
              placeholder="Max"
              value="${currentFilters[col]?.max ?? ''}"
            />
          </div>
        </div>
        `;
    } else if (fieldType === "date") {
      inputHtml = `
        <input
          type="date"
          class="form-control form-control-sm filter-input"
          data-field="${col}"
          data-operator="start"
          placeholder="Start"
          value="${currentFilters[col]?.start ?? ''}"
        />
        <input
          type="date"
          class="form-control form-control-sm filter-input mt-1"
          data-field="${col}"
          data-operator="end"
          placeholder="End"
          value="${currentFilters[col]?.end ?? ''}"
        />
      `;
    } else if (fieldType === "object") {
      // We give an operator select + a text input
      inputHtml = `
        <select class="form-select form-select-sm mb-1 filter-select" data-field="${col}">
          <option value="" ${!currentFilters[col] || !currentFilters[col].operator ? 'selected' : ''}>No Filter</option>
          <option value="contains" ${currentFilters[col]?.operator === 'contains' ? 'selected' : ''}>Contains</option>
          <option value="equals" ${currentFilters[col]?.operator === 'equals' ? 'selected' : ''}>Equals</option>
        </select>
        <input
          type="text"
          class="form-control form-control-sm filter-input"
          data-field="${col}"
          placeholder="Filter"
          value="${currentFilters[col]?.value ?? ''}"
        />
      `;
    } else if (fieldType === "nested") {
      inputHtml = `
      <select class="form-select form-select-sm mb-1 filter-select" data-field="${col}">
        <option value="" ${(!currentFilters[col] || !currentFilters[col].operator) ? 'selected' : ''}>No Filter</option>
        <option value="contains" ${(currentFilters[col]?.operator === 'contains') ? 'selected' : ''}>Contains</option>
        <option value="equals"   ${(currentFilters[col]?.operator === 'equals')   ? 'selected' : ''}>Equals</option>
      </select>
      <input
        type="text"
        class="form-control form-control-sm filter-input"
        data-field="${col}"
        placeholder="Value"
        value="${currentFilters[col]?.value ?? ''}"
      />
    `;
    } else {
      inputHtml = `
        <input
          type="text"
          class="form-control form-control-sm filter-input"
          data-field="${col}"
          placeholder="Filter"
        />
      `;
    }

    th.innerHTML = inputHtml;
    filterRow.appendChild(th);
  });
  tHead.appendChild(filterRow);

  // Attach filter events
  attachFilterEventListeners();

  // Data rows
  hits.forEach((doc) => {
    const tr = document.createElement("tr");
    columns.forEach((col) => {
      const td = document.createElement("td");
      let val = getNestedValue(doc._source, col.split("."));
      if (val === undefined) {
        if (col === "_id") val = doc._id;
        else if (col === "_index") val = doc._index;
        else if (col === "_score") val = doc._score;
      }
      if (typeof val === "object" && val !== null) {
        val = JSON.stringify(val);
      }

      td.textContent = val !== undefined && val !== null ? val : "";
      tr.appendChild(td);
    });
    tBody.appendChild(tr);
  });

  document.getElementById("pageInfo").textContent = `Page: ${
    currentPage + 1
  }, Showing: ${hits.length} of ${total}`;
}

/**
 * Attach filter event listeners.
 */
function attachFilterEventListeners() {
  const filterSelects = document.querySelectorAll(".filter-select");
  const filterInputs = document.querySelectorAll(".filter-input");

  filterSelects.forEach((select) => {
    select.addEventListener("change", function () {
      const field = this.getAttribute("data-field");
      const operator = this.value;
      const type = this.getAttribute("data-type");
      const numericFilterDiv = this.parentElement.querySelector(
        ".numeric-filter-inputs"
      );

      if (type === "numeric") {
        if (operator === "range") {
          numericFilterDiv
            .querySelector(".range-inputs")
            .style.setProperty("display", "block");
          numericFilterDiv
            .querySelector('input[data-operator="exact"]')
            .value = "";
          if (!currentFilters[field]) currentFilters[field] = {};
          currentFilters[field].operator = "range";
        } else if (operator === "exact") {
          numericFilterDiv
            .querySelector(".range-inputs")
            .style.setProperty("display", "none");
          if (!currentFilters[field]) currentFilters[field] = {};
          currentFilters[field].operator = "exact";
        } else {
          numericFilterDiv
            .querySelector(".range-inputs")
            .style.setProperty("display", "none");
          delete currentFilters[field];
        }
      }
    });
  });

  filterInputs.forEach((input) => {
    input.addEventListener("input", function (e) {
      const field = this.getAttribute("data-field");
      const operator = this.getAttribute("data-operator");
      const parentSelect = this.parentElement.querySelector(
        `select[data-field="${field}"]`
      );
      let filterObj = currentFilters[field] || {};

      if (parentSelect) {
        filterObj.operator = parentSelect.value;
      }

      if (operator === "exact") {
        const value = this.value.trim();
        filterObj.value = value;
        if (!value) delete filterObj.value;
      } else if (operator === "range-min") {
        filterObj.min = this.value.trim();
        if (!filterObj.min && !filterObj.max) delete currentFilters[field];
      } else if (operator === "range-max") {
        filterObj.max = this.value.trim();
        if (!filterObj.min && !filterObj.max) delete currentFilters[field];
      } else if (operator === "start") {
        filterObj.start = this.value.trim();
        if (!filterObj.start && !filterObj.end) delete currentFilters[field];
      } else if (operator === "end") {
        filterObj.end = this.value.trim();
        if (!filterObj.start && !filterObj.end) delete currentFilters[field];
      } else {
        // For text/keyword/objects
        const value = this.value.trim();
        filterObj.value = value;
        if (!value) delete filterObj.value;
      }

      if (Object.keys(filterObj).length) {
        currentFilters[field] = filterObj;
      }

      currentPage = 0;
      debounceSearch();
    });

    // Trigger immediate search on Enter
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        debounceSearch();
      }
    });
  });
}

const debounceSearch = debounce(async () => {
  await searchElasticsearch();
}, 500);

/**
 * Retrieve selected columns from the modal.
 */
function getSelectedColumns() {
  const listItems = document.querySelectorAll("#selectedFields li");
  return Array.from(listItems)
    .map((li) => {
      const span = li.querySelector("span");
      return span ? span.textContent : null;
    })
    .filter((col) => col !== null);
}

/**
 * Column selection logic.
 */
function populateFieldLists() {

  $("#availableFields").empty();
  $("#selectedFields").empty();

  //         If 'selectedColumnsOrder' is empty, fall back to getSelectedColumns() (first run).
  let finalSelectedCols = selectedColumnsOrder.length
      ? selectedColumnsOrder
      : getSelectedColumns(); // fallback for first time

  finalSelectedCols.forEach((fld) => {
    // If the user removed or reconnected an index, ensure 'fld' still exists in 'flattenedFields'
    if (flattenedFields.includes(fld)) {
      const alias = columnAliases[fld] || "";
      $("#selectedFields").append(`
        <li>
          <span title="${fld}">${fld}</span>
          <input
            type="text"
            class="form-control form-control-sm alias-input"
            placeholder="Alias"
            value="${alias}"
            data-column="${fld}"
          />
        </li>
      `);
    }
  });

  flattenedFields.forEach((fld) => {
    if (!finalSelectedCols.includes(fld)) {
      $("#availableFields").append(`<li title="${fld}">${fld}</li>`);
    }
  });

  $("#availableFields, #selectedFields")
    .sortable({
      connectWith: ".column-list",
      placeholder: "ui-state-highlight",
      receive: function (event, ui) {
        const targetList = $(this).attr("id");
        if (targetList === "selectedFields") {
          const fieldName = ui.item.text();
          const existingAlias = columnAliases[fieldName] || "";
          ui.item.html(`
            <span title="${fieldName}">${fieldName}</span>
            <input
              type="text"
              class="form-control form-control-sm alias-input"
              placeholder="Alias"
              value="${existingAlias}"
              data-column="${fieldName}"
            />
          `);
          ui.item.find("input.alias-input").on("input", function () {
            const column = $(this).data("column");
            const alias = $(this).val().trim();
            if (alias) {
              columnAliases[column] = alias;
            } else {
              delete columnAliases[column];
            }
          });
        } else {
          const fieldName = ui.item.find("span").text() || ui.item.text();
          ui.item.text(fieldName);
          delete columnAliases[fieldName];
        }
      },
    })
    .disableSelection();

  $("#availableFields li, #selectedFields li")
    .off("click")
    .on("click", function () {
      $(this).toggleClass("selected");
    });

  $("#selectedFields")
    .find("input.alias-input")
    .on("input", function () {
      const column = $(this).data("column");
      const alias = $(this).val().trim();
      if (alias) {
        columnAliases[column] = alias;
      } else {
        delete columnAliases[column];
      }
    });
}

function moveSelectedItems(fromSelector, toSelector, isAdding) {
  const selectedItems = $(`${fromSelector} li.selected`);
  if (selectedItems.length === 0) {
    showNotification("Please select at least one field.", "warning");
    return;
  }
  selectedItems.removeClass("selected").each(function () {
    if (isAdding) {
      const fieldName = $(this).text();
      const existingAlias = columnAliases[fieldName] || "";
      $(this).html(`
        <span title="${fieldName}">${fieldName}</span>
        <input
          type="text"
          class="form-control form-control-sm alias-input"
          placeholder="Alias"
          value="${existingAlias}"
          data-column="${fieldName}"
        />
      `);
      $(this)
        .find("input.alias-input")
        .on("input", function () {
          const column = $(this).data("column");
          const alias = $(this).val().trim();
          if (alias) {
            columnAliases[column] = alias;
          } else {
            delete columnAliases[column];
          }
        });
    } else {
      const fieldName = $(this).find("span").text() || $(this).text();
      $(this).text(fieldName);
      delete columnAliases[fieldName];
    }
  });
  $(toSelector).append(selectedItems);
}