import React from "react";

const style = {
  Container: {
    background: "rgb(50,50,50)",
    color: "white",
    fontFamily: "monospace",
    height: "100%",
    overflow: "scroll",
    padding: 8
  }
};
export default function LogViewer() {
  return (
    <div style={style.Container}>
      <h1>Logs</h1>
    </div>
  );
}
