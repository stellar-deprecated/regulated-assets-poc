const e = require("express");
const { Server, Asset } = require("stellar-sdk");
const { Account } = require("./models");
/**
 * @param {e.Request} req
 * @param {e.Response} res
 */
module.exports = async (req, res) => {
  const id = req.query.stellarAccount;
  console.log("Checking revocation status for " + id);
  const dbAccount = await Account.findOne({
    where: {
      stellarAccount: id
    }
  });
  res.send({ account: id, status: dbAccount.status });
};
