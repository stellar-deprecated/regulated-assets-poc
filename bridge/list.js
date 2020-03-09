const e = require("express");
const { Server, Asset } = require("stellar-sdk");
const { Account } = require("./models");

/**
 * @param {e.Request} req
 * @param {e.Response} res
 */
const handler = async (req, res) => {
  const server = new Server("https://horizon-testnet.stellar.org");
  const asset = new Asset("REG", process.env.ISSUER_ADDRESS);
  const horizonResponse = await server
    .accounts()
    .forAsset(asset)
    .limit(200)
    .call();
  const accounts = horizonResponse.records.map(record => {
    return { id: record.account_id, balances: record.balances };
  });
  for (var i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const [dbRecord] = await Account.findOrCreate({
      where: {
        stellarAccount: account.id
      }
    });
    account.status = dbRecord.status;
    account.accountName = dbRecord.accountName;
  }
  res.send(accounts);
};

module.exports = handler;
