const fetch = require("node-fetch");
const e = require("express");
const StellarSdk = require("stellar-sdk");

const { log } = require("./log");

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const issuer = StellarSdk.Keypair.fromSecret(process.env.ISSUER_SECRET);

/**
 * @callback rulesCallback
 * @param {StellarSdk.Transaction} transaction
 * @returns {Object} response
 * @returns {boolean} response.allowed Whether or not the proposed transaction should be allowed
 * @returns {string} response.error Optional error message if the transaction was rejected
 */

/**
 * @param {rulesCallback} rules
 */
module.exports = function (rules) {
  /**
   * @param {e.Request} req
   * @param {e.Response} res
   */
  const handler = async function (req, res, next) {
    log("POST " + req.url);
    log(" ");
    const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(
      req.query.tx,
      "base64"
    );
    const tx = new StellarSdk.Transaction(
      envelope,
      StellarSdk.Networks.TESTNET
    );
    const rulesResponse = await rules(tx, log);
    if (rulesResponse.error) {
      log("❌ Rejecting: " + rulesResponse.error);
      res.send({
        status: "rejected",
        error: rulesResponse.error,
      });
      log(" ");
      log(" ");
      return;
    }

    const [sourceAccount, feeStats] = await Promise.all([
      server.loadAccount(tx.source),
      server.feeStats(),
    ]);
    log("Building revised sandwiched transaction");

    const sandwichTxBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: feeStats.fee_charged.p90,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    });
    let assetsToParticipantMap = {};
    tx.operations.forEach((operation) => {
      if (operation.type === "payment") {
        const code = operation.asset.getCode();
        assetsToParticipantMap[code] =
          assetsToParticipantMap[code] || new Set();
        assetsToParticipantMap[code].add(operation.source || tx.source);
        assetsToParticipantMap[code].add(operation.destination);
      }
    });
    const setParticipantAuthorizations = (allow) => {
      Object.keys(assetsToParticipantMap).forEach((asset) => {
        const participants = assetsToParticipantMap[asset];
        participants.forEach((participantAddress) => {
          log(
            `  ${
              allow ? "Allowing" : "Revoking"
            } asset ${asset} for participant ${participantAddress}`
          );
          sandwichTxBuilder.addOperation(
            StellarSdk.Operation.allowTrust({
              trustor: participantAddress,
              assetCode: asset,
              authorize: allow,
              source: issuer.publicKey(),
            })
          );
        });
      });
    };

    setParticipantAuthorizations(true);
    log("  Adding operations from original transaction ");
    envelope
      .tx()
      .operations()
      .forEach((op) => sandwichTxBuilder.addOperation(op));
    setParticipantAuthorizations(false);
    log(" ");
    // 5 minute for demo purposes so it doesn't timeout while we talk about it
    sandwichTxBuilder.setTimeout(300);
    const revisedTx = sandwichTxBuilder.build();
    revisedTx.sign(issuer);
    log("Approved, sending revised transaction back to wallet");
    log(" ");
    log(" ");
    res.send({
      status: "revised",
      tx: revisedTx.toEnvelope().toXDR().toString("base64"),
    });
  };
  return handler;
};
