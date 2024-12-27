# Advanced Elasticsearch GUI

**Description**  
This is a modular, advanced Elasticsearch GUI built using only **HTML, CSS, JavaScript, and Bootstrap 5**. It provides secure connections to Elasticsearch via Basic Auth, an interactive data grid for querying/filtering documents, powerful export capabilities, data visualizations with Chart.js, user preference management, onboarding tutorials, localization, and basic index management.

---

## Features

1. **Server Connection**
   - Connect to Elasticsearch with URL, username, and password.
   - Basic Authentication with error handling (invalid credentials, unreachable URL, etc.).
   - Visual feedback on connection status (success, failure).

2. **Data Grid**
   - Paginated, dynamic table with robust filtering (field-type-specific).
   - Column selection, ordering, user-defined aliases.
   - Performance-optimized for large datasets.

3. **Export & Reporting**
   - Export as CSV, JSON, Excel, or PDF.
   - Full dataset export (not limited to the current page).
   - Professional PDF formatting with titles, pagination, and footers.

4. **Index & Field Management**
   - Displays indices in a dropdown.
   - Shows field mappings and handles nested/complex fields.
   - **Create and delete indices** via the included `management.js`.

5. **Advanced Filtering**
   - Field-type-specific filters (text, keyword, numeric, date, nested).
   - Real-time filtering with debounce to optimize performance.
   - **Extended filter widgets** (range sliders, date pickers) demonstrated in `filters.js`.

6. **Data Visualizations**
   - Integrate with Chart.js for bar, pie, line charts, and more.
   - Interactive modal to display and export visualizations.

7. **UI/UX Excellence**
   - Responsive design for desktop, tablet, and mobile.
   - Dark mode toggle, contrast adjustment for accessibility.
   - Clean layout and modern design.

8. **Error & Performance Handling**
   - Centralized error logging (`errorHandling.js`).
   - User-friendly messages for issues like failed data fetches.
   - Loading indicators to handle large-volume data.

9. **User Preferences & Persistence**
   - **Preferences** (filters, column settings, dark mode, language) are stored in `preferences.js`.
   - Saves to `localStorage` so user states persist between sessions.

10. **Localization & Onboarding**
    - **Localization** with multiple languages in `localization.js` (example with English, Spanish).
    - **Onboarding** steps in `onboarding.js` with a simple multi-step tutorial using Bootstrap popovers.

11. **Code Organization & Best Practices**
    - Clean, modular file structure for easy development and debugging.
    - Reusable components, thorough inline comments.
    - Extensible with additional features (e.g., index alias management, advanced charting).

---

## Folder Structure

```bash
ELASTICSEARCH-GUI/
├── css/
│   ├── main.css
│   └── dark-mode.css
├── js/
│   ├── utils/
│   │   ├── errorHandling.js
│   │   └── helpers.js
│   ├── app.js
│   ├── connection.js
│   ├── dataGrid.js
│   ├── export.js
│   ├── filters.js
│   ├── localization.js
│   ├── management.js
│   ├── onboarding.js
│   ├── preferences.js
│   └── visualization.js
├── index.html
└── README.md
```
---

## Installation & Setup

1. **Clone this repository** or download the zip.  

2. **Elasticsearch**  
   - Ensure you have an Elasticsearch instance running and accessible.

3. **No Back-End Needed**  
   - This GUI is front-end only. Simply open `index.html` in your browser.

4. **Configure**  
   - If your Elasticsearch instance uses Basic Auth, provide username/password in the Connection form.
   - The default language is English (`en`). Adjust or extend languages in `localization.js`.

5. **Run**  
   - Open `index.html` in a modern web browser (Chrome, Firefox, Edge, etc.).
   - Enter your Elasticsearch details (URL, username, password) and click **Connect**.

---

## Usage Guide

1. **Connect**  
   - Provide URL (e.g., `http://localhost:9200`), username, and password if needed.
   - If connection fails, check console logs for more info.

2. **Index Management**  
   - After connecting, choose an index from the dropdown.
   - (Optional) Use `management.js` functions to create or delete an index if you add a form or button.

3. **Data Grid**  
   - The grid shows documents from the selected index.
   - Use the **filter row** to refine results by field. For example, "contains", "equals", numeric "range", etc.
   - Switch pages or change **Records per page** to see more results.

4. **Export**  
   - Export data to CSV, JSON, Excel, or PDF (top-right buttons in the Data Grid section).
   - Entire dataset can be exported, not just the current page.

5. **Visualizations**  
   - Click **Open Visualization Modal** to view a sample bar chart.
   - Extend `visualization.js` to create custom charts for your data.

6. **User Preferences**  
   - The GUI automatically saves your chosen columns, filters, language, and dark mode preference to localStorage.
   - On page reload, these preferences are reapplied.

7. **Onboarding**  
   - Click **Start Tutorial** (in the Onboarding section, if shown) to see a step-by-step guide.
   - Popovers highlight each major part of the UI in sequence.

8. **Localization**  
   - Default language is English; partial Spanish support is shown in `localization.js`.
   - Switch languages with `setLanguage('es')` or `setLanguage('en')`.

---

## Troubleshooting

1. **Connection Fails**  
   - Check that Elasticsearch is running and your URL/credentials are correct.  
   - Look at browser console for errors (CORS, network, auth issues).

2. **No Indices**  
   - Verify your Elasticsearch instance has indices.  
   - Or create a new index with the management functions.

3. **Empty Data Grid**  
   - Possibly your filters are too narrow.  
   - Clear or adjust filters, and check for console errors.

4. **Exports Not Working**  
   - Large data exports can take time or memory.  
   - PDF generation relies on `jspdf` and `jspdf-autotable`; ensure these libs loaded successfully.

5. **Localization Strings Missing**  
   - Check `translations` in `localization.js` and add the missing keys.  
   - Inspect console for warnings about undefined language keys.

6. **Range Sliders or Date Pickers**  
   - Ensure jQuery UI is loaded (for slider) or your chosen date picker library is included.  
   - If `attachDatePickerToDateFields` is commented, remove the comment to enable it.

---

## Demo Video

*(Optional)* Record a short screen capture walking through:
- Connecting to Elasticsearch.
- Selecting an index.
- Filtering data.
- Exporting results.
- Opening the visualization modal.

---

**Enjoy your advanced Elasticsearch GUI!** Feel free to extend it further to suit your needs.  
