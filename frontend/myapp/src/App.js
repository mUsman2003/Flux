import React from "react";
import Taskbar from "./components/Taskbar.js";
import Body from "./components/body.js";
import DJController from "./components/DJController";

function App() {
  return (
    <div>
        <div>
        <Taskbar />
        </div>
        <DJController />
      <Body/>
    </div>
  );
}

export default App;
