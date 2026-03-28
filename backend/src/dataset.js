const fs = require("fs");
const csv = require("csv-parser");
const crypto = require("crypto");

let rows = [];

// Load dataset
function loadDataset(path) {
  return new Promise((resolve, reject) => {
    const temp = [];

    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => temp.push(data))
      .on("end", () => {
        rows = temp;
        console.log("Dataset loaded:", rows.length);
        resolve(rows.length);
      })
      .on("error", reject);
  });
}

// Get record
function getRow(recordId) {
  if (recordId < 0 || recordId >= rows.length) return null;
  return rows[recordId];
}

// Hash mental health record
function hashRow(row) {
  const fields = Object.keys(row); // auto-detect columns

  const canonical = fields
    .map((k) => String(row[k]).trim())
    .join("|");

  return (
    "0x" +
    crypto.createHash("sha256").update(canonical).digest("hex")
  );
}

module.exports = { loadDataset, getRow, hashRow };