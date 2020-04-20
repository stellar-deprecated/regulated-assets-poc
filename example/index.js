require("dotenv").config();
const express = require("express");
const rules = require("./rules");
const regulatedAssetBridge = require("../bridge");

const PORT = process.env.BRIDGE_PORT || 3001;
const app = express();

app.use(regulatedAssetBridge(rules));

app.listen(PORT, () => {
  console.log(`Bridge listening on port ${PORT}`);
});
