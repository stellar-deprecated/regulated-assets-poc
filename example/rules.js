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
  const paymentOperations = [];
  log("Checking operations in proposed transaction");
  transaction.operations.forEach((operation) => {
    log("  Type: " + operation.type);
    log("  Source: " + (operation.source || transaction.source));
    log("  Destination: " + operation.destination);
    log("  Asset: " + operation.asset.getCode());
    log("  Amount: " + operation.amount);
    if (operation.type === "payment") {
      paymentOperations.push(operation);
    }
  });
  if (paymentOperations.length != 1) {
    return {
      allowed: false,
      error:
        "Only transactions with a single payment operation can be approved in this example.",
    };
  }
  const paymentOp = paymentOperations[0];

  if (parseFloat(paymentOp.amount) > 50) {
    return { allowed: false, error: "Payment amount must be less than 50" };
  }

  const destination = paymentOp.destination;
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
  if (balance.balance + parseFloat(paymentOp.amount) > 1000) {
    return {
      allowed: false,
      error: "Payment would put destination account above the 1000 token limit",
    };
  }
  return { allowed: true };
};

module.exports = rules;
