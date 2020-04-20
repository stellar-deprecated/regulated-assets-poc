const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");

/**
 * @callback rulesCallback
 * @param {string} value
 * @returns {boolean}
 */

/**
 * @param {rulesCallback} rules
 */
module.exports = function (rules) {
  const middleware = [cors(), bodyParser.json()];
  const router = express.Router();
  router.use(cors());
  router.use(bodyParser.json());

  // Internal API for admin panel
  router.post("/admin/revoke", require("./revoke"));
  router.get("/admin/list", require("./list"));
  router.get("/admin/logs", require("./log"));

  // External API for wallets
  router.get("/.well-known/stellar.toml", require("./toml"));
  router.get("/api/deposit", require("./deposit"));
  router.get("/api/approve", require("./approve")(rules));
  router.get("/api/approve/status", require("./revocationStatus"));

  router.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({ error: err });
  });

  return router;
};
