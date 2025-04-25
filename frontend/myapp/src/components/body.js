import React from "react";

const Body = () => {
  const bodyStyle = {
    background: "linear-gradient(180deg, #121212 0%, #0a0a0a 100%)",
    minHeight: "100vh",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    padding: "20px",
    fontFamily: "'Rajdhani', 'Roboto', sans-serif",
    color: "#e0e0e0",
    overflow: "hidden",
    boxSizing: "border-box",
    margin: 0,
  };

  return <div style={bodyStyle}></div>;
};

export default Body;