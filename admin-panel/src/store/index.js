import { createStore, applyMiddleware, combineReducers } from "redux";

import ReduxThunk from "redux-thunk";
import accounts from "./accounts";

const reducer = combineReducers({
  accounts
});

const store = createStore(reducer, applyMiddleware(ReduxThunk));
export default store;
