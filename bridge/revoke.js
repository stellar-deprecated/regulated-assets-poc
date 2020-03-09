const e = require("express");
const { Server, Asset } = require("stellar-sdk");
const { Account } = require("./models");
/**
 * @param {e.Request} req
 * @param {e.Response} res
 */
const handler = async (req, res) => {
  const accountToRevoke = req.body.account;
  const toRevoke = req.body.revoke;
  console.log("Revoking " + accountToRevoke);
  const dbAccount = await Account.findOne({
    where: {
      stellarAccount: accountToRevoke
    }
  });
  await dbAccount.setRevoked(toRevoke);
  res.send({ success: true });
};

module.exports = handler;
