import React from "react";

const Body = () => {
  const bodyStyle = {
    background: "linear-gradient(180deg, #121212 0%, #0a0a0a 100%)",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Rajdhani', 'Roboto', sans-serif",
    color: "#e0e0e0",
    overflow: "hidden",
  };

  return <div style={bodyStyle}></div>;
};

export default Body;