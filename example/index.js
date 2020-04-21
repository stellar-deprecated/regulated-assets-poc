require("dotenv").config();
const express = require("express");
const rules = require("./rules");
const regulatedAssetBridge = require("..");

const PORT = process.env.BRIDGE_PORT || 3001;
const app = express();

// Set up the regulated assets endpoints with the specified ruleset
app.use(regulatedAssetBridge(rules));
// Use the default toml file.  Many business will want to provide their own.
// The important thing is to have the approval_server field
app.use(regulatedAssetBridge.toml);

app.listen(PORT, () => {
  console.log(`Bridge listening on port ${PORT}`);
});
