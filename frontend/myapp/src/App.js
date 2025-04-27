import React from "react";
import Taskbar from "./components/Taskbar.js";
import DJController from "./components/DJController";

function App() {
  return (
    <div style={{
      backgroundColor: "black",
      minHeight: "100vh",
      minWidth: "100vw",
      color: "white",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
    }}>
      
      
      
      <div style={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <DJController />
      </div>

    </div>
  );
}

export default App;
