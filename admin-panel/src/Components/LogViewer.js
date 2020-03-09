import React from "react";
import { useSSE } from "react-hooks-sse";

const style = {
  Container: {
    background: "rgb(50,50,50)",
    color: "white",
    fontFamily: "monospace",
    height: "100%",
    overflow: "scroll",
    padding: 8,
    whiteSpace: "pre"
  },
  ClearButton: {
    transform: "translateY(-2px)",
    background: "transparent",
    borderRadius: 8,
    color: "white"
  }
};
export default function LogViewer() {
  const logs = useSSE("message", {
    initialState: [],
    stateReducer: (state, changes) => {
      return [...state, changes.data];
    }
  });

  return (
    <div style={style.Container}>
      <h1>
        Logs <button style={style.ClearButton}>Clear</button>
      </h1>
      {logs.map(log => (
        <div key={log.message}>{log.message}</div>
      ))}
    </div>
  );
}
