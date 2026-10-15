/**
 * ===================================================================
 * MISSION AI: IMPOSSIBLE — GOOGLE APPS SCRIPT WEBHOOK BACKEND
 * ===================================================================
 * 
 * STEP-BY-STEP SETUP INSTRUCTIONS:
 * 
 * 1. Open Google Sheets (https://sheets.new) and create a new sheet.
 *    (Rename the spreadsheet to "Mission AI Impossible - Leaderboard").
 * 
 * 2. In Google Sheets menu, click:
 *    Extensions -> Apps Script
 * 
 * 3. Delete any default code in the editor, and PASTE this ENTIRE file into it.
 * 
 * 4. Click the "Save" icon (Floppy disk).
 * 
 * 5. Click the blue "Deploy" button (top right) -> "New deployment".
 * 
 * 6. Under "Select type" (gear icon), choose: "Web app".
 * 
 * 7. Set configuration:
 *    - Description: Mission AI Impossible Webhook
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone  <-- (CRITICAL: Must be "Anyone" so player laptops can send data)
 * 
 * 8. Click "Deploy". Authorize permissions if prompted.
 * 
 * 9. Copy the "Web app URL" (it looks like: https://script.google.com/macros/s/AKfycb.../exec).
 * 
 * 10. In your project, create or open your `.env` file and add:
 *     VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/AKfycb.../exec
 * 
 * That's it! Every team's completion time will now automatically appear in your Google Sheet!
 */

// Handles saving new team completion records from the game
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Parse the JSON payload sent by the game
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ result: "error", message: "No data payload" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Auto-create styled header row if sheet is completely empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Team Code", 
        "Team Name", 
        "Time Taken (Seconds)", 
        "Formatted Time", 
        "Challenges Completed", 
        "Status", 
        "Recorded At"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#38bdf8");
      sheet.setFrozenRows(1);
    }

    // Append the team's record
    sheet.appendRow([
      data.team_code || "UNKNOWN",
      data.team_name || "RECOVERY UNIT",
      Number(data.time_taken_seconds || 0),
      data.formatted_time || "00m 00s",
      Number(data.challenges_completed || 3),
      data.status || "COMPLETED",
      new Date().toLocaleString()
    ]);

    // Optional: Auto-sort rows by time taken (Column C = Column 3) ascending
    var numRows = sheet.getLastRow();
    if (numRows > 2) {
      var dataRange = sheet.getRange(2, 1, numRows - 1, 7);
      dataRange.sort({ column: 3, ascending: true });
    }

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handles live leaderboard querying from the game modal (Alt + L)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var values = sheet.getDataRange().getValues();

    if (!values || values.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var results = [];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (row[0]) {
        results.push({
          team_code: String(row[0]),
          team_name: String(row[1]),
          time_taken_seconds: Number(row[2]),
          formatted_time: String(row[3]),
          challenges_completed: Number(row[4] || 3),
          status: String(row[5] || "COMPLETED"),
          completed_at: String(row[6] || new Date().toISOString())
        });
      }
    }

    // Sort fastest completion first
    results.sort(function(a, b) {
      return a.time_taken_seconds - b.time_taken_seconds;
    });

    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
