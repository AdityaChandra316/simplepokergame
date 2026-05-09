import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Join from "./Join.jsx";
import Create from "./Create.jsx";
import Game from "./Game.jsx";
import "./index.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/join" element={<Join/>}/>
        <Route path="/create" element={<Create/>}/>
        <Route path="/game/:room" element={<Game/>}/>
        <Route path="*" element={<Navigate to="/join" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
