const express = require("express");
const { contract } = require("./web3");
const { getRow, hashRow } = require("./dataset");

const router = express.Router();

// =============================
// 📥 FETCH RECORD
// =============================
// purpose:
// 1 = THERAPY
// 2 = RESEARCH
// 3 = EMERGENCY

router.get("/record/:id", async (req, res) => {
  const recordId = Number(req.params.id);
  const purpose = Number(req.query.purpose);
  const from = (req.query.from || "").trim();

  // ✅ validations
  if (!from) {
    return res.status(400).json({ error: "Missing wallet address" });
  }

  if (![1, 2, 3].includes(purpose)) {
    return res.status(400).json({ error: "Invalid purpose (use 1/2/3)" });
  }

  const row = getRow(recordId);
  if (!row) {
    return res.status(404).json({ error: "Invalid recordId" });
  }

  const h = hashRow(row);

  try {
    // 🔐 Check permission
    const granted = await contract.methods
      .canAccess(from, recordId, purpose)
      .call();

    // 📜 Log on blockchain
    await contract.methods
      .logAccess(recordId, purpose, h)
      .send({ from, gas: 300000 });

    // 🚀 REAL-TIME EMIT
    const io = req.app.get("io");

    io.emit("new-access-log", {
      recordId,
      purpose,
      granted,
      user: from
    });

    // ❌ Access denied
    if (!granted) {
      return res.status(403).json({
        granted: false,
        message: "Access denied (logged on blockchain)",
        hash: h
      });
    }

    // 🔬 RESEARCH
    if (purpose === 2) {
      return res.json({
        granted: true,
        recordId,
        data: {
          age: row.Age,
          gender: row.Gender,
          diagnosis: row.Depression
        },
        hash: h
      });
    }

    // 🚨 EMERGENCY
    if (purpose === 3) {
      return res.json({
        granted: true,
        recordId,
        data: {
          diagnosis: row.Depression,
          suicidalThoughts: row["Have you ever had suicidal thoughts ?"]
        },
        hash: h
      });
    }

    // 👩‍⚕️ THERAPY
    return res.json({
      granted: true,
      recordId,
      data: row,
      hash: h
    });

  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});


// =============================
// 📊 AUDIT STATS
// =============================
router.get("/audit/stats", async (req, res) => {
  try {
    const count = await contract.methods.auditCount().call();

    let last = null;

    if (Number(count) > 0) {
      const a = await contract.methods
        .getAudit(Number(count) - 1)
        .call();

      last = {
        time: a.time ?? a[0],
        user: a.user ?? a[1],
        role: String(a.role ?? a[2]),
        recordId: String(a.recordId ?? a[3]),
        purpose: String(a.purpose ?? a[4]),
        granted: Boolean(a.granted ?? a[5]),
        recordHash: a.recordHash ?? a[6]
      };
    }

    res.json({
      totalLogs: String(count),
      lastAccess: last
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// =============================
// 🔐 GRANT ACCESS
// =============================
router.post("/grant-access", async (req, res) => {
  try {
    const { web3, contract } = require("./web3");
    const accounts = await web3.eth.getAccounts();

    const user = req.body.user;

    if (!user) {
      return res.status(400).json({ error: "Missing user address" });
    }

    await contract.methods
      .grantAccess(user)
      .send({ from: accounts[0] });

    res.json({
      success: true,
      message: "Access granted on blockchain"
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// =============================
// ❌ REVOKE ACCESS (optional)
// =============================
router.post("/revoke-access", async (req, res) => {
  try {
    const { web3, contract } = require("./web3");
    const accounts = await web3.eth.getAccounts();

    const user = req.body.user;

    if (!user) {
      return res.status(400).json({ error: "Missing user address" });
    }

    await contract.methods
      .revokeAccess(user)
      .send({ from: accounts[0] });

    res.json({
      success: true,
      message: "Access revoked on blockchain"
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// =============================
module.exports = router;