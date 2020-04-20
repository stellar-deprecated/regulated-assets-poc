const StellarSdk = require("stellar-sdk");

/**
 * @param {StellarSdk.Transaction} transaction Proposed transaction
 * @param {function} log Tracing for display in admin panel or logs
 * @returns {Object} response
 * @returns {booelan} response.success Whether or not the proposed transaction should be allowed
 * @returns {string} response.error Optional error message if the transaction was rejected
 */
const rules = (transaction, log) => {
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
  log(" ");
  log("Total Amount: " + totalAmount);
  log(" ");
  if (totalAmount <= 50) {
    return { allowed: true };
  } else {
    return { allowed: false, error: "Total amount must be less than 50" };
  }
};

module.exports = rules;
