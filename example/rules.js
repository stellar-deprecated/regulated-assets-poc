const StellarSdk = require("stellar-sdk");
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const log = (m) => console.log(m);
const issuer = StellarSdk.Keypair.fromSecret(process.env.ISSUER_SECRET);
const assetCode = process.env.ASSET_CODE;

/**
 * @param {StellarSdk.Transaction} transaction Proposed transaction
 * @param {function} log Tracing for display in admin panel or logs
 * @returns {Object} response
 * @returns {boolean} response.allowed Whether or not the proposed transaction should be allowed
 * @returns {string} response.error Optional error message if the transaction was rejected
 */
const rules = async (transaction) => {
  let totalAmount = 0;
  let assetsToParticipantMap = {};
  let participants = [];
  log("Checking operations in proposed transaction");
  transaction.operations.forEach((operation) => {
    log("  Type: " + operation.type);
    log("  Source: " + (operation.source || transaction.source));
    log("  Destination: " + operation.destination);
    log("  Asset: " + operation.asset.getCode());
    log("  Amount: " + operation.amount);
    participants.push(operation.destination);
    participants.push(operation.source || transaction.source);
    if (operation.type === "payment") {
      const code = operation.asset.getCode();
      assetsToParticipantMap[code] = assetsToParticipantMap[code] || new Set();
      totalAmount += parseFloat(operation.amount);
      assetsToParticipantMap[code].add(operation.source || transaction.source);
      assetsToParticipantMap[code].add(operation.destination);
    }
  });
  log("Total Amount: " + totalAmount);
  if (totalAmount > 50) {
    return { allowed: false, error: "Total amount must be less than 50" };
  }

  for (var i = 0; i < transaction.operations.length; i++) {
    const op = transaction.operations[i];
    const { destination } = op;
    const account = await server.loadAccount(destination);
    const balance = account.balances.find(
      (balance) =>
        balance.asset_code === assetCode &&
        balance.asset_issuer === issuer.publicKey()
    );
    if (!balance) {
      return {
        allowed: false,
        error: "Destination has no trustline to the asset",
      };
    }
    if (balance.balance + parseFloat(op.amount) > 1000) {
      return {
        allowed: false,
        error:
          "Payment would put destination account above the 1000 token limit",
      };
    }
  }
  return { allowed: true };
};

module.exports = rules;
