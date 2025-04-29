import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test('renders Digital DJ Pro heading', () => {
  const { getByText } = render(<App />);
  expect(getByText(/DIGITAL DJ PRO/i)).toBeInTheDocument();
});
