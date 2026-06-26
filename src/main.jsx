import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


import "./styles/main.css";
import { initAnalytics } from "./utils/analytics";

initAnalytics();

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
if (API_URL) {
  const prefetch = (path) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `${API_URL}${path}`;
    document.head.appendChild(link);
  };
  prefetch('/api/content/home');
  prefetch('/api/products');
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);