import React from "react";
import { useSelector } from "react-redux";

const style = {
  h1: {
    fontSize: 16
  },
  h3: {
    fontSize: 24
  },
  container: {
    padding: 8,
    display: "flex",
    flexDirection: "row"
  },

  circulationContainer: {
    justifySelf: "flex-end",
    textAlign: "end"
  },

  title: {
    fontSize: 24,
    margin: 8,
    flexGrow: 1,
    textAlign: "center"
  }
};
export default function Header() {
  const { accounts, loading } = useSelector(state => state.accounts);

  /**
   * @param {ServerApi.AccountRecord} account
   * @param {string} code
   */
  function balanceOf(account, code) {
    const balanceObj = account.balances.find(
      balance => balance.asset_code === code
    );
    if (!balanceObj) return 0;
    return parseFloat(balanceObj.balance);
  }
  const active = accounts.reduce((value, account) => {
    return (
      value + (account.status === "active" ? balanceOf(account, "REG") : 0)
    );
  }, 0);

  return (
    <div style={style.container}>
      <div>
        <h1 style={style.h1}>Asset</h1>
        <h3 style={style.h3}>REG</h3>
      </div>
      <div style={style.title}>Asset Issuer Admin Panel</div>
      <div style={style.circulationContainer}>
        <h1 style={style.h1}>In Circulation</h1>
        <h3 style={style.h3}>{loading ? "Loading..." : active}</h3>
      </div>
    </div>
  );
}
