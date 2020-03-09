import React from "react";
import { SSEProvider } from "react-hooks-sse";
import AccountsList from "./Components/AccountsList";
import Header from "./Components/Header";
import LogViewer from "./Components/LogViewer";

const style = {
  App: {
    width: 900,
    margin: "auto",
    background: "white",
    height: "100%",
    boxShadow: "0 4px 4px rgba(0,0,0,0.3)"
  },

  FlexPart: {
    height: "50%",
    overflow: "scroll"
  }
};
function App() {
  return (
    <div style={style.App}>
      <div style={style.FlexPart}>
        <Header />
        <AccountsList />
      </div>
      <div style={style.FlexPart}>
        <SSEProvider endpoint="http://localhost:3001/admin/logs">
          <LogViewer />
        </SSEProvider>
      </div>
    </div>
  );
}

export default App;
