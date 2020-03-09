require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const PORT = process.env.BRIDGE_PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser());

// Internal API for admin panel
app.post("/admin/revoke", require("./revoke"));
app.get("/admin/list", require("./list"));
app.get("/admin/logs", require("./log"));

// External API for wallets
app.get("/.well-known/stellar.toml", require("./toml"));
app.get("/api/deposit", require("./deposit"));
app.get("/api/approve", require("./approve"));
app.get("/api/approve/status", require("./revocationStatus"));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({ error: err });
});

app.listen(PORT, () => {
  console.log(`Bridge listening on port ${PORT}`);
});
