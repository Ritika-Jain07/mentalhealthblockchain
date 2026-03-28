const express = require("express");
const cors = require("cors");
const path = require("path");
const { loadDataset } = require("./dataset");
const accessRoutes = require("./accessRoutes");
require("dotenv").config({ path: "../.env" });const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend (index.html inside /public)
app.use(express.static(path.join(__dirname, "../public")));
// API routes
app.use("/api", accessRoutes);

// Health check (useful for testing)
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

// Start server
(async () => {
  try {
    if (!process.env.DATASET_PATH) {
      throw new Error("❌ DATASET_PATH missing in .env");
    }

    const n = await loadDataset(process.env.DATASET_PATH);
    console.log("✅ Dataset loaded rows:", n);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
  }
})();