const cors = require("cors");
const StellarSdk = require("stellar-sdk");
const bodyParser = require("body-parser");
const express = require("express");

/**
 * @callback rulesCallback
 * @param {StellarSdk.Transaction} transaction
 * @returns {boolean}
 * @param {rulesCallback} rules
 */
const BridgeRoutes = function (rules) {
  const router = express.Router();
  router.use(cors());
  router.use(bodyParser.json());
  router.get("/api/approve", require("./bridge/approve")(rules));

  router.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({ error: err });
  });

  return router;
};

BridgeRoutes.toml = express.Router();
BridgeRoutes.toml.get("/.well-known/stellar.toml", require("./bridge/toml"));

module.exports = BridgeRoutes;
