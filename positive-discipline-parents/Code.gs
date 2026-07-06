/**
 * Positive Discipline Parenting — Quiz + Enquiry Logger
 * Deploy as Web App (Execute as: Me, Access: Anyone) and paste the resulting
 * /exec URL into app.js (course) and promo.html (landing page) as APPS_SCRIPT_URL.
 *
 * Routes by ?type= :
 *   type=enquiry -> logs a lead from the promo landing page to "Enquiries" sheet
 *   (default)    -> logs a module quiz result to "Responses" sheet
 */

function doGet(e) {
  try {
    var p = e.parameter;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ts = p.ts ? new Date(parseInt(p.ts, 10)) : new Date();

    if (p.type === 'enquiry') {
      var esheet = ss.getSheetByName('Enquiries');
      if (!esheet) {
        esheet = ss.insertSheet('Enquiries');
        esheet.appendRow(['Timestamp', 'Name', 'Phone', 'Place', 'Child Age Group', 'Program Interest', 'Source']);
      }
      esheet.appendRow([
        ts,
        p.name || '',
        p.phone || '',
        p.place || '',
        p.age_group || '',
        p.program || '',
        p.source || ''
      ]);
    } else {
      var sheet = ss.getSheetByName('Responses');
      if (!sheet) {
        sheet = ss.insertSheet('Responses');
        sheet.appendRow(['Timestamp', 'Course', 'Module', 'Score', 'Total', 'Name', 'Phone']);
      }
      sheet.appendRow([
        ts,
        p.course || '',
        p.module || '',
        p.score || '',
        p.total || '',
        p.name || '',
        p.phone || ''
      ]);
    }
  } catch (err) {
    // swallow errors so the pixel request never breaks the page
  }

  // A plain text response is enough — the page uses this as a fire-and-forget
  // <img> pixel request purely to avoid CORS issues; it never reads or displays
  // the response, so no image bytes need to be returned.
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}
