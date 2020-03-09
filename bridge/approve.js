const fetch = require("node-fetch");
const e = require("express");
const StellarSdk = require("stellar-sdk");
const { Account } = require("./models");
const truncateAddress = require("./util/truncateAddress");
const { log } = require("./log");

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const issuer = StellarSdk.Keypair.fromSecret(process.env.ISSUER_SECRET);

/**
 * @param {e.Request} req
 * @param {e.Response} res
 */
module.exports = async function(req, res, next) {
  log("POST " + req.url);
  log(" ");
  const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(
    req.query.tx,
    "base64"
  );
  const tx = new StellarSdk.Transaction(envelope, StellarSdk.Networks.TESTNET);
  let totalAmount = 0;
  let assetsToParticipantMap = {};
  let participants = [];
  log("Checking operations in proposed transaction");
  tx.operations.forEach(operation => {
    log("  Type: " + operation.type);
    log("  Source: " + (operation.source || tx.source));
    log("  Destination: " + operation.destination);
    log("  Asset: " + operation.asset.getCode());
    log("  Amount: " + operation.amount);
    participants.push(operation.destination);
    participants.push(operation.source || tx.source);
    if (operation.type === "payment") {
      const code = operation.asset.getCode();
      assetsToParticipantMap[code] = assetsToParticipantMap[code] || new Set();
      totalAmount += parseFloat(operation.amount);
      assetsToParticipantMap[code].add(operation.source || tx.source);
      assetsToParticipantMap[code].add(operation.destination);
    }
  });
  log(" ");
  log("Total Amount: " + totalAmount);
  log(" ");
  log("<<< Consulting Rules Engine API >>>");
  await new Promise(res => setTimeout(res, 1300));
  log(" ");
  if (totalAmount > 50) {
    log("❌ Rejecting, amount over 50 REG limit");
    res.send({
      status: "rejected",
      error: "Amount over 50 REG limit"
    });
    log(" ");
    log(" ");
    return;
  }

  for (var i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const dbAccount = await Account.findOne({
      where: {
        stellarAccount: participant
      }
    });
    if (dbAccount.status !== "active") {
      const message = `Account ${truncateAddress(
        participant
      )} has had token access revoked`;
      log(`❌ Rejecting: ${message}`);
      res.send({
        status: "rejected",
        error: message
      });
      log(" ");
      log(" ");
      return;
    }
  }

  const [sourceAccount, feeStats] = await Promise.all([
    server.loadAccount(tx.source),
    server.feeStats()
  ]);
  log("Building revised sandwiched transaction");

  const sandwichTxBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: feeStats.fee_charged.p90,
    networkPassphrase: StellarSdk.Networks.TESTNET
  });

  const setParticipantAuthorizations = allow => {
    Object.keys(assetsToParticipantMap).forEach(asset => {
      const participants = assetsToParticipantMap[asset];
      participants.forEach(participantAddress => {
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
            source: issuer.publicKey()
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
    .forEach(op => sandwichTxBuilder.addOperation(op));
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
    tx: revisedTx
      .toEnvelope()
      .toXDR()
      .toString("base64")
  });
};
