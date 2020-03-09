import React, { useEffect } from "react";
import s from "./AccountList.module.css";
import { useSelector, useDispatch } from "react-redux";
import { refreshAccountList, revoke } from "../store/accounts";

/**
 * @param {Object} props
 * @param {ServerApi.AccountRecord} props.account
 */
function AccountRow({ account }) {
  const dispatch = useDispatch();
  const pendingAccounts = useSelector(state => state.accounts.pendingAccounts);
  const isPending = pendingAccounts.indexOf(account.id) !== -1;
  const regBalance = account.balances.find(
    balance => balance.asset_code === "REG"
  );
  const isRevoked = account.status === "revoked";
  const buttonTitle = isRevoked ? "Allow" : "Revoke";
  return (
    <tr>
      <td>{account.id}</td>
      <td>{account.accountName}</td>
      <td>{parseFloat(regBalance.balance).toFixed(2)} </td>
      <td>{account.status}</td>
      <td>
        <button onClick={e => dispatch(revoke(account.id, !isRevoked))}>
          {isPending ? "..." : buttonTitle}
        </button>
      </td>
    </tr>
  );
}
export default function AccountsList() {
  const dispatch = useDispatch();
  const { accounts } = useSelector(state => state.accounts);

  useEffect(() => {
    dispatch(refreshAccountList());
  }, [dispatch]);
  return (
    <div>
      <div>
        <table className={s.AccountsList}>
          <thead>
            <tr>
              <th>Account</th>
              <th>Name</th>
              <th>Balance</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => {
              return (
                <AccountRow key={account.id} account={account}></AccountRow>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
