const START_LOADING = "accounts/START_LOADING";
const RECEIVE_ACCOUNTS = "accounts/RECEIVE_ACCOUNTS";
const ADD_PENDING_ACCOUNT = "accounts/ADD_PENDING_ACCOUNT";
const REMOVE_PENDING_ACCOUNT = "accounts/REMOVE_PENDING_ACCOUNT";

const initialState = {
  loading: false,
  accounts: [],
  pendingAccounts: []
};

export function refreshAccountList() {
  return function(dispatch) {
    dispatch({ type: START_LOADING });
    return fetch("/admin/list")
      .then(r => r.json())
      .then(accounts => {
        dispatch({ type: RECEIVE_ACCOUNTS, accounts });
      });
  };
}

export function revoke(account, toRevoke) {
  return async function(dispatch) {
    dispatch({ type: ADD_PENDING_ACCOUNT, account });
    await fetch("/admin/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ account, revoke: toRevoke })
    }).then(r => r.json());
    await dispatch(refreshAccountList());
    dispatch({ type: REMOVE_PENDING_ACCOUNT, account });
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case START_LOADING:
      return {
        ...state,
        loading: true
      };
    case RECEIVE_ACCOUNTS:
      return {
        ...state,
        accounts: action.accounts,
        loading: false
      };
    case ADD_PENDING_ACCOUNT:
      const newPendingAccounts = [...state.pendingAccounts];
      if (newPendingAccounts.indexOf(action.account) === -1) {
        newPendingAccounts.push(action.account);
      }
      return {
        ...state,
        pendingAccounts: newPendingAccounts
      };
    case REMOVE_PENDING_ACCOUNT:
      return {
        ...state,
        pendingAccounts: state.pendingAccounts.filter(a => a !== action.account)
      };
    default:
      return state;
  }
}
