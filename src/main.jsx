import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { installAppUpdates } from "./app/updates.js";
import "./styles/app.css";
import "./styles/lesson.css";
createRoot(document.getElementById("root")).render(<App />);
installAppUpdates();
