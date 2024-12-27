"use strict";

/**
 * visualization.js
 * --------------------------------
 * Manages the creation and display of charts
 * (bar, pie, line, etc.) using Chart.js
 */

function initializeVisualizationControls() {
  document
    .getElementById("openVisualizationModalBtn")
    .addEventListener("click", () => {
      const visModal = new bootstrap.Modal(document.getElementById("visualizationModal"));
      visModal.show();
      renderSampleChart();
    });
}

/**
 * Renders a sample chart (bar, line, etc.) inside #chartContainer
 * In a real app, you'd gather user parameters, queries, etc.
 */
function renderSampleChart() {
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = `<canvas id="myChart" width="400" height="400"></canvas>`;
  const ctx = document.getElementById("myChart").getContext("2d");

  // Example data
  const data = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Sample Data",
        data: [12, 19, 3, 5, 2],
        backgroundColor: ["#0d6efd", "#6c757d", "#dc3545", "#0dcaf0", "#198754"],
      },
    ],
  };

  // Example bar chart
  new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}
