const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http"); // ✅ NEW
const { Server } = require("socket.io"); // ✅ NEW

const { loadDataset } = require("./dataset");
const accessRoutes = require("./accessRoutes");

require("dotenv").config({ path: "../.env" });

const app = express();

// ✅ CREATE HTTP SERVER
const server = http.createServer(app);

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: { origin: "*" }
});

// 🔥 make io usable in routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api", accessRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

// ✅ SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);
});

// Start server
(async () => {
  try {
    if (!process.env.DATASET_PATH) {
      throw new Error("❌ DATASET_PATH missing in .env");
    }

    const datasetPath = path.join(__dirname, process.env.DATASET_PATH);
    const n = await loadDataset(datasetPath);

    console.log("✅ Dataset loaded rows:", n);

    const PORT = process.env.PORT || 5000;

    // ❗ IMPORTANT: use server.listen NOT app.listen
    server.listen(PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
  }
})();