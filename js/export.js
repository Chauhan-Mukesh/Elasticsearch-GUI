"use strict";

/**
 * export.js
 * --------------------------------
 * Manages exporting of Elasticsearch data
 * in CSV, JSON, Excel, PDF, etc.
 */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);
  document.getElementById("exportJsonBtn").addEventListener("click", exportJSON);
  document.getElementById("exportExcelBtn").addEventListener("click", exportExcel);
  document.getElementById("exportPdfBtn").addEventListener("click", exportPDF);
});

/**
 * Exports data as CSV.
 */
async function exportCSV() {
  try {
    const allHits = await searchElasticsearch(true);
    if (!allHits.length) {
      showNotification("No data to export.", "warning");
      return;
    }
    const columns = getSelectedColumns();
    if (!columns.length) {
      showNotification("No columns selected for export.", "warning");
      return;
    }
    const headers = columns.map((col) => `"${columnAliases[col] || col}"`).join(",");
    const rows = [headers];
    allHits.forEach((hit) => {
      const rowVals = columns.map((col) => {
        let val = getNestedValue(hit._source, col.split("."));
        if (val === undefined) {
          if (col === "_id") val = hit._id;
          else if (col === "_index") val = hit._index;
          else if (col === "_score") val = hit._score;
        }
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        return val !== undefined && val !== null ? `"${val.toString().replace(/"/g, '""')}"` : "";
      });
      rows.push(rowVals.join(","));
    });
    const csvContent = rows.join("\n");
    downloadFile(csvContent, "export.csv", "text/csv");
    showNotification("CSV export completed!", "success");
  } catch (err) {
    console.error(err);
    showNotification("Error exporting CSV: " + err.message, "danger");
  }
}

/**
 * Exports data as JSON.
 */
async function exportJSON() {
  try {
    const allHits = await searchElasticsearch(true);
    if (!allHits.length) {
      showNotification("No data to export.", "warning");
      return;
    }
    const columns = getSelectedColumns();
    if (!columns.length) {
      showNotification("No columns selected for export.", "warning");
      return;
    }
    const exportData = allHits.map((hit) => {
      const obj = {};
      columns.forEach((col) => {
        const alias = columnAliases[col] || col;
        let val = getNestedValue(hit._source, col.split("."));
        if (val === undefined) {
          if (col === "_id") val = hit._id;
          else if (col === "_index") val = hit._index;
          else if (col === "_score") val = hit._score;
        }
        obj[alias] = val !== undefined && val !== null ? val : "";
      });
      return obj;
    });
    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, "export.json", "application/json");
    showNotification("JSON export completed!", "success");
  } catch (err) {
    console.error(err);
    showNotification("Error exporting JSON: " + err.message, "danger");
  }
}

/**
 * Exports data as Excel using SheetJS.
 */
async function exportExcel() {
  try {
    const allHits = await searchElasticsearch(true);
    if (!allHits.length) {
      showNotification("No data to export.", "warning");
      return;
    }
    const columns = getSelectedColumns();
    if (!columns.length) {
      showNotification("No columns selected for export.", "warning");
      return;
    }
    const data = allHits.map((hit) => {
      const obj = {};
      columns.forEach((col) => {
        const alias = columnAliases[col] || col;
        let val = getNestedValue(hit._source, col.split("."));
        if (val === undefined) {
          if (col === "_id") val = hit._id;
          else if (col === "_index") val = hit._index;
          else if (col === "_score") val = hit._score;
        }
        if (typeof val === "object" && val !== null) val = JSON.stringify(val);
        obj[alias] = val !== undefined && val !== null ? val : "";
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "export.xlsx");
    showNotification("Excel export completed!", "success");
  } catch (err) {
    console.error(err);
    showNotification("Error exporting Excel: " + err.message, "danger");
  }
}

/**
 * Exports data as PDF using jsPDF & autoTable.
 */
async function exportPDF() {
  try {
    const allHits = await searchElasticsearch(true);
    if (!allHits.length) {
      showNotification("No data to export.", "warning");
      return;
    }
    const columns = getSelectedColumns();
    if (!columns.length) {
      showNotification("No columns selected for export.", "warning");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Elasticsearch Data Export", 14, 20);

    // Index Name
    doc.setFontSize(12);
    doc.text(`Index: ${selectedIndex}`, 14, 30);

    // Prepare data
    const tableHeaders = columns.map((col) => columnAliases[col] || col);
    const data = allHits.map((hit) => {
      return columns.map((col) => {
        let val = getNestedValue(hit._source, col.split("."));
        if (val === undefined) {
          if (col === "_id") val = hit._id;
          else if (col === "_index") val = hit._index;
          else if (col === "_score") val = hit._score;
        }
        if (typeof val === "object" && val !== null) val = JSON.stringify(val);
        return val !== undefined && val !== null ? val.toString() : "";
      });
    });

    doc.autoTable({
      head: [tableHeaders],
      body: data,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 58, 64], textColor: [255, 255, 255] },
      theme: "striped",
      margin: { top: 40 },
      didDrawPage: function (data) {
        let str = "Page " + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
    });

    doc.save("export.pdf");
    showNotification("PDF export completed!", "success");
  } catch (err) {
    console.error(err);
    showNotification("Error exporting PDF: " + err.message, "danger");
  }
}

/**
 * Downloads a file via blob creation.
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}
