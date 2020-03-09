const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite"
});

class Account extends Sequelize.Model {
  setRevoked(revoked) {
    this.update({
      status: revoked ? "revoked" : "active"
    });
  }
}

Account.init(
  {
    stellarAccount: {
      type: Sequelize.STRING,
      allowNull: false
    },
    accountName: {
      type: Sequelize.STRING,
      defaultValue: "Unknown User"
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "active",
      validate: {
        isIn: [["active", "revoked"]]
      }
    }
  },
  {
    sequelize
  }
);

Account.sync();

module.exports = {
  Account
};
