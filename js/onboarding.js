"use strict";

/**
 * onboarding.js
 * --------------------------------
 * Implements onboarding tutorials, step-by-step
 * tooltips, or guided tours for new users.
 *
 * This version demonstrates a simple multi-step approach
 * using Bootstrap popovers or modals.
 */

// In-memory state for the onboarding steps
let onboardingSteps = [
  {
    element: "#connectionSection",
    title: "Step 1: Connect to Elasticsearch",
    content:
      "Enter your Elasticsearch URL, username, and password here. Then click Connect.",
  },
  {
    element: "#indexManagementSection",
    title: "Step 2: Select an Index",
    content: "Choose which index you want to explore from this dropdown.",
  },
  {
    element: "#dataGridSection",
    title: "Step 3: View & Filter Data",
    content:
      "Use the filter row on top of the table to refine your results by field. You can also paginate here!",
  },
  {
    element: "#visualizationSection",
    title: "Step 4: Visualize Data",
    content:
      "Generate charts and graphs to better understand your data. Click Open Visualization Modal!",
  },
  {
    element: "#exportCsvBtn",
    title: "Step 5: Export Your Results",
    content:
      "Export your data in CSV, JSON, Excel, or PDF. Useful for reporting and offline analysis!",
  },
];

let currentOnboardingStep = 0;

/**
 * initializeOnboarding
 * --------------------
 * Binds the "Start Tutorial" button to begin the step-by-step tour.
 */
function initializeOnboarding() {
  const startBtn = document.getElementById("startOnboardingBtn");
  if (startBtn) {
    startBtn.addEventListener("click", startTutorial);
  }
}

/**
 * startTutorial
 * -------------
 * Initiates the multi-step onboarding.
 */
function startTutorial() {
  currentOnboardingStep = 0;
  showOnboardingStep(currentOnboardingStep);
}

/**
 * showOnboardingStep
 * ------------------
 * Displays a popover or modal for the current step.
 */
function showOnboardingStep(stepIndex) {
  if (stepIndex >= onboardingSteps.length) {
    // All steps completed
    showNotification("Onboarding tutorial finished!", "success");
    return;
  }

  const step = onboardingSteps[stepIndex];
  const element = document.querySelector(step.element);

  if (!element) {
    // If the element doesn't exist, skip to next step
    nextOnboardingStep();
    return;
  }

  // Create a Bootstrap Popover
  const popover = new bootstrap.Popover(element, {
    title: step.title,
    content: `
      <div style="margin-bottom: 8px;">${step.content}</div>
      <button type="button" class="btn btn-primary btn-sm" id="nextOnboardingBtn">
        Next
      </button>
    `,
    html: true,
    trigger: "manual",
    placement: "top",
  });

  // Show popover
  popover.show();

  // Scroll into view
  element.scrollIntoView({ behavior: "smooth", block: "center" });

  // Listen for the "Next" button inside the popover
  const nextBtnInterval = setInterval(() => {
    const nextBtn = document.getElementById("nextOnboardingBtn");
    if (nextBtn) {
      clearInterval(nextBtnInterval);
      nextBtn.addEventListener("click", () => {
        popover.hide();
        nextOnboardingStep();
      });
    }
  }, 200);
}

/**
 * nextOnboardingStep
 * ------------------
 * Advances to the next step in the tutorial.
 */
function nextOnboardingStep() {
  currentOnboardingStep++;
  showOnboardingStep(currentOnboardingStep);
}
