const { Server, CollectionPage, AccountRecord, Asset } = require("stellar-sdk");
const { Account } = require("./models");
/**
 * @param {CollectionPage<AccountRecord>} accounts
 */
const updateAccounts = async accounts => {
  for (var i = 0; i < accounts.records.length; i++) {
    const account = accounts.records[i];
    let id = account.account_id;
    const regBalance = account.balances.find(
      b =>
        b.asset_code === process.env.ASSET_CODE &&
        b.asset_issuer === process.env.ISSUER_ADDRESS
    );
    const [acct, created] = await Account.findOrCreate({
      where: {
        stellarAccount: id
      }
    });

    await acct.update({
      balance: regBalance.balance
    });
  }
};
const run = async () => {
  const server = new Server("https://horizon-testnet.stellar.org");
  const asset = new Asset("REG", process.env.ISSUER_ADDRESS);
  const accounts = await server
    .accounts()
    .forAsset(asset)
    .limit(200)
    .call();
  updateAccounts(accounts);
};

module.exports = run;
